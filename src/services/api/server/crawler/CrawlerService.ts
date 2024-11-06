import {getSites} from '../list/DBQueries';
import {parseHtmlString} from '../../../parser';
import type {CrawlerParsed, ParsedData} from '../../../parser.types.ts';
import type {SitesData} from '../../../site.types.ts';
import {SiteFileReaderService} from './SiteFileReaderService.ts';
import {chunkArray} from './helpers.ts';
import {getTimeDifference} from '../../../date.ts';

export class CrawlerService {
  private interval?: NodeJS.Timeout;
  private isWorking = false;
  // private static readonly timeout = 3 * 60 * 1000; // 3 min
  private static readonly timeout = 60 * 1000; // 3 min

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

  private clientsSender = new Map<string, (data: Array<CrawlerParsed>) => void>();

  public start() {
    console.log('START');
    if (this.isWorking) {
      this.stop();
    }

    this.isWorking = true;
    // Send a new event every timeout minutes
    this.interval = setInterval(async () => {
      await this.checkSites();
    }, CrawlerService.timeout);

    this.checkSites();
  }

  public stop() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.isWorking = false;
  }

  public async connectClient(id: string, sendEvent: (data: Array<CrawlerParsed>) => void) {
    this.clientsSender.set(id, sendEvent);

    // Initial connection message
    sendEvent([]);

    const siteChunks = await this.getSiteChunks();

    // Check if we didn't ping some site before
    for (const chunk of siteChunks) {
      if (!this.isWorking) {
        break;
      }

      const sitesToLoad = await this.getNotLoadedSites(chunk);

      if (sitesToLoad.length !== 0) {
        await this.loadData(sitesToLoad);
      }

      const parsed = await Promise.all(chunk.map(site => CrawlerService.getVersions(site)));
      // Load saved data
      sendEvent(parsed);
    }
  }

  public disconnectClient(id: string) {
    this.clientsSender.delete(id);
  }

  private async getNotLoadedSites(sites: SitesData[]) {
    const sitesToLoad: SitesData[] = [];
    await Promise.all(sites.map(async site => {
      const isFileExists = await SiteFileReaderService.fileExists(site.url);
      if (!isFileExists) {
        sitesToLoad.push(site);
      }
    }));

    return sitesToLoad;
  }

  private async getSiteChunks() {
    const sites = await getSites();
    // Chunk the site list for limited concurrency (optional)
    return chunkArray(sites, CrawlerService.CONCURRENCY_LIMIT);
  }

  public async checkSites() {
    console.log("Starting site checks...");

    const siteChunks = await this.getSiteChunks();

    for (const chunk of siteChunks) {
      if (!this.isWorking) {
        break;
      }
      await this.loadData(chunk);

      if (this.clientsSender.size > 0) {
        await this.notifyClients(chunk);
      }
    }
  }

  public async loadData(sites: SitesData[]) {
    console.log('load Chunk');
    for (const site of sites) {
      const {url} = site;
      try {
        const response = await fetch(url + CrawlerService.ACTION);
        const text = await response.text();
        await SiteFileReaderService.saveToFile(url, text);
      } catch (e) {
        console.error(e);
      }
    }
  }

  public async notifyClients(sites: SitesData[]) {
    if (this.clientsSender.size === 0) {
      throw new Error("No saving event!");
    }
    try {
      const data = await Promise.all(sites.map(site => CrawlerService.getVersions(site)));

      for (const event of this.clientsSender.values()) {
        event(data);
      }
    } catch (e) {
      console.log(e);
    }
  }

  private static async getVersions(site: SitesData): Promise<CrawlerParsed> {
    const {url, settings} = site;
    try {
      const text = await SiteFileReaderService.getFromFile(url);
      const parsed = parseHtmlString(text);

      const lastEditedSite = await SiteFileReaderService.getLastEditTime(url);
      const timeDiff = getTimeDifference(lastEditedSite, new Date());
      // If the site was last updated more than 5 timeouts ago, the server is considered offline.
      const isOnline = timeDiff.minutes < (CrawlerService.timeout * 5);
      return {parsedData: parsed, url, online: isOnline, settings};
    } catch (e) {
      console.error(e);
      return {url, online: false, settings, parsedData: null};
    }
  }
}
