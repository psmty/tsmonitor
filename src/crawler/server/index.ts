import { getSites, setUrlOnline } from "../../db/DBQueries";
import { CrawlerService } from "./CrawlerService";

const timeout = 3 * 60 * 1000; // 3 min

// The static instance that holds the single instance of the class
let instance: CrawlerService | undefined;

export const CONCURRENCY_LIMIT = 10;
const ACTION = "/Home/VersionInfo";

// Static method to get the single instance of the class
export const getInstance = (): CrawlerService => {
  // Check if the instance already exists; if not, create it
  if (!instance) {
    instance = new CrawlerService({
      timeout,
      concurrency: CONCURRENCY_LIMIT,
      actionUrl: ACTION,
      getSites: () => getSites(),
      setOnline: async (url, isOffline) => {
        setUrlOnline(url, isOffline);
      },
    });
  }
  return instance;
};
