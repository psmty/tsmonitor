import {getSites} from '../list/DBQueries';
import {parseHtmlString} from '../../../parser';
import type {CrawlerParsed, ParsedData} from '../../../parser.types.ts';
import type {SitesData} from '../../../site.types.ts';
import type { APIContext } from 'astro';

export class CrawlerService {
  private interval?: NodeJS.Timeout;
  private isWorking = false;
  private readonly timeout = 3 * 60 * 1000; // 3 min

  // The static instance that holds the single instance of the class
  private static instance: CrawlerService;

  public static readonly CONCURRENCY_LIMIT = 10;
  public static readonly ACTION = "/Home/VersionInfo";

  // Static method to get the single instance of the class
  public static getInstance(): CrawlerService {
    // Check if the instance already exists; if not, create it
    if (!CrawlerService.instance) {
      CrawlerService.instance = new CrawlerService();
    }
    return CrawlerService.instance;
  }


  private sendEvent?: (data: Array<CrawlerParsed>) => void;

  public start(context: APIContext, sendEvent: (data: Array<CrawlerParsed>) => void) {
    if (this.isWorking) {
      this.stop();
    }

    this.sendEvent = sendEvent;
    this.isWorking = true;
    // Send a new event every timeout minutes
    this.interval = setInterval(async () => {
      await this.checkSites(context);
    }, this.timeout);

    // Initial connection message
    this.checkSites(context);
  }

  public stop() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.isWorking = false;
    this.sendEvent = undefined;
  }

  public async checkSites(context: APIContext) {
    console.log("Starting site checks...");

    const sites = await getSites(context);
    // Chunk the site list for limited concurrency (optional)
    const siteChunks = CrawlerService.chunkArray(sites, CrawlerService.CONCURRENCY_LIMIT);

    for (const chunk of siteChunks) {
      if (!this.isWorking) {
        break;
      }
      await this.loadData(chunk);
    }
  }

  public async loadData(sites: SitesData[]) {
    if (this.sendEvent === undefined) {
      throw new Error("No saving event!");
    }
    const data = await Promise.all(sites.map(site => CrawlerService.getVersions(site)));
    this.sendEvent?.(data);
  }

  private static async getVersions(site: SitesData): Promise<CrawlerParsed> {
    const {url, settings} = site;
    try {
      const response = await fetch(url + CrawlerService.ACTION);
      const text = await response.text();
      const parsed = parseHtmlString(text);
      return {parsedData: parsed, url, online: true, settings};
    } catch (e) {
      console.error(e);
      return {url, online: false, settings, parsedData: null};
    }
  }

  // Utility function to chunk an array into smaller arrays of a specified size
  public static chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
