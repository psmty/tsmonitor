import { getSites, setUrlOnline } from "../../db/DBQueries";
import { CrawlerService } from "./CrawlerService";

// The static instance that holds the single instance of the class
let instance: CrawlerService | undefined;

const ACTION = "/Home/VersionInfo";

// Static method to get the single instance of the class
export const getInstance = (): CrawlerService => {
  // Check if the instance already exists; if not, create it
  if (!instance) {
    instance = new CrawlerService({
      timeout: 3 * 60 * 1000, // 3 min,
      actionUrl: ACTION,
      getSites: () => getSites(),
      setOnline: async (url, isOffline) => {
        setUrlOnline(url, isOffline);
      },
    });
  }
  return instance;
};
