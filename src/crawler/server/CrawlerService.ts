import { type CrawlerParsed, type SitesData } from "../../services";
import { deleteFile, getFromFile, saveToFile } from "./fileService";
import { chunkArray } from "./helpers";

async function getVersionFromFile(site: SitesData): Promise<CrawlerParsed> {
  try {
    const parsedData = await getFromFile(site.url);
    return { ...site, parsedData, };
  } catch (e) {
    return { ...site, parsedData: null };
  }
}

export class CrawlerService {
  private interval?: NodeJS.Timeout;
  private isWorking = false;
  private recentlyDeletedUrls = new Set<string>();

  private clientsSender = new Map<
    string,
    (data: Array<CrawlerParsed>) => void
  >();

  constructor(
    private config: {
      timeout: number;
      concurrency: number;
      actionUrl: string;
      getSites: () => Promise<Array<SitesData>>;
      setOnline: (url: string, isOffline: boolean) => Promise<void>;
    },
  ) {}

  startIfNotWorking() {
    if (!this.isWorking) {
      this.start();
    }
  }

  async start() {
    console.log("START CrawlerService");
    if (this.isWorking) {
      this.stop();
    }

    this.isWorking = true;
    // Check sites on start
    await this.checkSites();

    const runSiteCheckInterval = () => {
      clearTimeout(this.interval);
      // Send a new event every timeout minutes
      this.interval = setTimeout(async () => {
        // Check all sites
        await this.checkSites();

        // Run again after all checks completed
        runSiteCheckInterval();
      }, this.config.timeout);
    };

    runSiteCheckInterval();
  }

  stop() {
    if (this.interval) {
      clearTimeout(this.interval);
    }
    this.isWorking = false;
  }

  async connectClient(
    id: string,
    sendEvent: (data: Array<CrawlerParsed>) => void,
  ) {
    this.clientsSender.set(id, sendEvent);

    // Initial connection message
    sendEvent([]);

    const siteChunks = chunkArray(
      await this.config.getSites(),
      this.config.concurrency,
    );

    // Check if we didn't ping some site before
    for (const chunk of siteChunks) {
      if (!this.isWorking) {
        break;
      }

      const parsed = await Promise.all(chunk.map(getVersionFromFile));
      // Load saved data
      sendEvent(parsed);
    }
  }

  disconnectClient(id: string) {
    this.clientsSender.delete(id);
  }

  private async checkSites() {
    const siteChunks = chunkArray(
      await this.config.getSites(),
      this.config.concurrency,
    );

    for (const chunk of siteChunks) {
      if (!this.isWorking) {
        break;
      }

      const actualChunk = chunk.filter(
        (item) => !this.recentlyDeletedUrls.has(item.url),
      );
      const sites = await this.fetchAndSaveToFile(actualChunk);

      if (this.clientsSender.size > 0) {
        await this.notifyClients(sites);
      }
    }

    this.recentlyDeletedUrls.clear();
  }

  fetchAndSaveToFile(sites: SitesData[]): Promise<SitesData[]> {
    return Promise.all(sites.map(async (s) => {
      const site = { ...s };
      try {
        const response = await fetch(site.url + this.config.actionUrl);

        if (!response.ok) {
          throw new Error(`Response is failed with status code: ${response.status}`)
        }

        const text = await response.text();
        await saveToFile(site.url, text);
        await this.config.setOnline(site.url, true);
        site.online = true;
      } catch (e) {
        await this.config.setOnline(site.url, false);
        site.online = false;
      } finally {
        return { ...site, pingat: new Date() };
      }
    }));
  }

  async notifyClients(sites: SitesData[]) {
    if (this.clientsSender.size === 0) {
      throw new Error("No saving event!");
    }
    try {
      const data = await Promise.all(sites.map(getVersionFromFile));

      for (const event of this.clientsSender.values()) {
        event(data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async deleteSites(urls: string[]) {
    try {
      urls.forEach((url) => {
        this.recentlyDeletedUrls.add(url);
      });
      await Promise.all(
        urls.map(async (url) => {
          await deleteFile(url);
        }),
      );
    } catch {}
  }
}
