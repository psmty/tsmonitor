import { type CrawlerParsed, type SitesData } from "../../services";
import { deleteFile, getFromFile, saveToFile } from "./fileService";
import axios from "axios";

import Bottleneck from "bottleneck";

const JOB_TIMEOUT = 10000;

// Configure Bottleneck
const limiter = new Bottleneck({
  minTime: 300, // 300ms between jobs
  maxConcurrent: 20, // Adjust based on your system and network capacity
  timeout: JOB_TIMEOUT, // Cancel jobs that take longer than 10 seconds
});

// Configure retries for failed jobs
limiter.on('failed', async (error, jobInfo) => {
  console.error(`Job for ${jobInfo.args[0]} failed:`, error.message);

  if (jobInfo.retryCount < 3) { // Retry up to 3 times
    return 10000; // Retry after 10 second
  }
});

async function getVersionFromFile(site: SitesData): Promise<CrawlerParsed> {
  try {
    const parsedData = await getFromFile(site.url);
    return { ...site, parsedData };
  } catch (e) {
    return { ...site, parsedData: null };
  }
}

export class CrawlerService {
  private isWorking = false;
  private recentlyDeletedUrls = new Set<string>();

  private clientsSender = new Map<
    string,
    (data: Array<CrawlerParsed>) => void
  >();

  constructor(
    private config: {
      timeout: number;
      actionUrl: string;
      getSites: (urls?: string[]) => Promise<Array<SitesData>>;
      setOnline: (url: string, isOffline: boolean) => Promise<void>;
    },
  ) {}

  async startIfNotWorking() {
    if (this.isWorking) {
      return;
    }
    console.log("START CrawlerService");

    this.isWorking = true;

    const runCrawler = async () => {
      const startTime = Date.now(); // Record start time
      try {
        await this.crawlAllSites(await this.config.getSites());
      } catch (error) {
        console.error("Error during crawl:", error);
      }
    
      // Calculate elapsed time
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, this.config.timeout - elapsedTime);
  
      console.log(`Crawl completed in ${elapsedTime}ms. Next crawl in ${remainingTime}ms.`);
      setTimeout(runCrawler, remainingTime);
    };

    return runCrawler();
  }

  async crawlAllSites(data: SitesData[], force = false) {
    const crawlPromises: Promise<SitesData | null>[] = (data).map((site) =>
      limiter.schedule({
        // increase priority if force
        priority: force ? 1 : 8,
      }, async () => {
        return !this.recentlyDeletedUrls.has(site.url)
          ? await this.fetchAndSaveToFile(site)
          : null;
      }),
    );
    await Promise.all(crawlPromises);
    this.recentlyDeletedUrls.clear();
    if (this.clientsSender.size > 0) {
      let parsed: Array<CrawlerParsed> = [];
      // if force don't load saved data
      if (force) {
        parsed = await Promise.all((await this.config.getSites(data.map((s) => s.url))).map(getVersionFromFile));
      } else {
        parsed = await Promise.all((await this.config.getSites()).map(getVersionFromFile));
      }
      await this.notifyClients(parsed);
    }
  };

  async connectClient(
    id: string,
    sendEvent: (data: Array<CrawlerParsed>) => void,
  ) {
    this.clientsSender.set(id, sendEvent);

    // Initial connection message
    sendEvent([]);

    if (!this.isWorking) {
      return;
    }
    const parsed = await Promise.all((await this.config.getSites()).map(getVersionFromFile));
    // Load saved data
    sendEvent(parsed);
  }

  disconnectClient(id: string) {
    this.clientsSender.delete(id);
  }

  async fetchAndSaveToFile(s: SitesData): Promise<SitesData> {
    const site = { ...s };
    try {
      const { data } = await axios.get(site.url + this.config.actionUrl, {
        timeout: JOB_TIMEOUT - 1000,
      });
      await saveToFile(site.url, data);
      await this.config.setOnline(site.url, true);
      site.online = true;
    } catch (e) {
      await this.config.setOnline(site.url, false);
      site.online = false;
    } finally {
      return { ...site, pingat: new Date() };
    }
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
