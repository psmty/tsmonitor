import { CrawlerService } from "./CrawlerService";
import { getSites, setUrlOnline } from "../../db/DBQueries";
import { clientsSender } from "./stream";

const ACTION = "/Home/VersionInfo";
// Static method to get the single instance of the class
export const crawler = new CrawlerService({
  timeout: 3 * 60 * 1000, // 3 min,
  actionUrl: ACTION,
  getSites: () => getSites(),
  setOnline: async (url, isOffline) => {
    setUrlOnline(url, isOffline);
  },
  async notifyClients() {
    if (clientsSender.size === 0) {
      return;
    }
    try {
      const data = await this.getSites();

      for (const event of clientsSender.values()) {
        event(data);
      }
    } catch (e) {
      console.error(e);
    }
  },
});
