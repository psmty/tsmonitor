import {
  type CrawlerParsed,
  type SitesData,
  parseHtmlString,
  getTimeDifference,
} from "../../services";
import {deleteFile, fileExists, getFromFile, getLastEditTime, saveToFile} from "./fileService";
import { chunkArray } from "./helpers";

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
    },
  ) {}

  startIfNotWorking() {
    if (!this.isWorking) {
      this.start();
    }
  }

  start() {
    console.log("START CrawlerService");
    if (this.isWorking) {
      this.stop();
    }

    this.isWorking = true;
    // Send a new event every timeout minutes
    this.interval = setInterval(async () => {
      await this.checkSites();
    }, this.config.timeout);

    this.checkSites();
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
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

    const siteChunks = await this.getSiteChunks();

    // Check if we didn't ping some site before
    for (const chunk of siteChunks) {
      if (!this.isWorking) {
        break;
      }

      const sitesToLoad: SitesData[] = [];
      await Promise.all(
        chunk.map(async (site) => {
          const isFileExists = await fileExists(site.url);
          if (!isFileExists) {
            sitesToLoad.push(site);
          }
        }),
      );

      if (sitesToLoad.length !== 0) {
        await this.loadData(sitesToLoad);
      }

      const parsed = await Promise.all(
        chunk.map((site) =>
          CrawlerService.getVersions(site, this.config.timeout),
        ),
      );
      // Load saved data
      sendEvent(parsed);
    }
  }

  disconnectClient(id: string) {
    this.clientsSender.delete(id);
  }

  private async getSiteChunks() {
    // Chunk the site list for limited concurrency (optional)
    return chunkArray(await this.config.getSites(), this.config.concurrency);
  }

  async checkSites() {
    const siteChunks = await this.getSiteChunks();

    for (const chunk of siteChunks) {
      if (!this.isWorking) {
        break;
      }

      const actualChunk = chunk.filter((item) => !this.recentlyDeletedUrls.has(item.url))

      await this.loadData(actualChunk);

      if (this.clientsSender.size > 0) {
        await this.notifyClients(actualChunk);
      }
    }

    this.recentlyDeletedUrls.clear();
  }

  async loadData(sites: SitesData[]) {
    for (const site of sites) {
      const { url } = site;
      try {
        const response = await fetch(url + this.config.actionUrl);
        const text = await response.text();
        await saveToFile(url, text);
      } catch (e) {
        console.error(e);
      }
    }
  }

  async notifyClients(sites: SitesData[]) {
    if (this.clientsSender.size === 0) {
      throw new Error("No saving event!");
    }
    try {
      const data = await Promise.all(
        sites.map((site) =>
          CrawlerService.getVersions(site, this.config.timeout),
        ),
      );

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
       })
      await Promise.all(urls.map(async (url) => {
        await deleteFile(url);
      }));
    } catch (e) {
      console.error("Deletion failed:", e);
    }
  }

  private static async getVersions(
    site: SitesData,
    timeout: number,
  ): Promise<CrawlerParsed> {
    const { url, settings } = site;
    try {
      const text = await getFromFile(url);
      const parsed = parseHtmlString(text);

      const lastEditedSite = await getLastEditTime(url);
      const timeDiff = getTimeDifference(lastEditedSite, new Date());
      // If the site was last updated more than 5 timeouts ago, the server is considered offline.
      const isOnline = timeDiff.minutes < timeout * 5;
      return { parsedData: parsed, url, online: isOnline, settings };
    } catch (e) {
      console.error(e);
      return { url, online: false, settings, parsedData: null };
    }
  }
}
