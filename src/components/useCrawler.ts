import { ref, onUnmounted } from "vue";
import type {ParsedData, Site, SitesData, SiteSettings} from "../services";
import {DEFAULT_SETTINGS} from '../services/edit.defaults.ts';


export function useCrawler(
  concurrencyLimit = 10,
  intervalMs = 3 * 60 * 1000,
) {
  let intervalId: NodeJS.Timeout | null = null;
  const siteStatuses = ref(new Map<string, Site>());

  // Function to initiate the crawler
  function startCrawler(sites: SitesData[]) {
    addSites(sites);
    intervalId = setInterval(() => checkSites(), intervalMs); // Schedule subsequent checks
  }

  // Function to stop the crawler
  function stopCrawler() {
    if (intervalId) clearInterval(intervalId);
  }

  function addSites(values: SitesData[]) {
    values.forEach(({url, settings}) => {
      if (!siteStatuses.value.has(url)) {
        siteStatuses.value.set(url, { url, online: true, lastChecked: null, processedData: null, ...(settings ?? DEFAULT_SETTINGS) });
      }
    });
    checkSites();
  }

  function updateSiteSettings({url, settings}: SitesData) {
    if (!siteStatuses.value.has(url)) {
      console.error(`${url} is not exists`)
      return;
    }

    const currentData = siteStatuses.value.get(url)!;
    siteStatuses.value.set(url, {...currentData, ...settings});
    checkSites();
  }

  // Function to check all sites in batches
  async function checkSites() {
    console.log("Starting site checks...");

    // Chunk the site list for limited concurrency (optional)
    const siteChunks = chunkArray([...siteStatuses.value.values()], concurrencyLimit);

    // Process each chunk sequentially, but each chunk runs in parallel
    for (const chunk of siteChunks) {
      await Promise.all(chunk.map((site) => requestUpdate(site)));
    }
  }

  // Request update for a single site
  async function requestUpdate(site: Site): Promise<void> {
    try {
      const response = await fetch("/api/crawler", {
        method: "POST",
        body: JSON.stringify([site.url]),
      });

      if (!response.ok) {
        throw new Error(`Update failed with status ${response.status}`);
      }

      const sites: ParsedData[] = await response.json();

      siteStatuses.value.set(site.url, {
        ...site,
        online: true,
        lastChecked: new Date(),
        ...sites[0],
      });
      siteStatuses.value = new Map(siteStatuses.value);
    } catch (error) {
      siteStatuses.value.set(site.url, {
        ...site,
        online: false,
        lastChecked: new Date(),
      })
      siteStatuses.value = new Map(siteStatuses.value);
      console.error(`Failed to update site: ${site.url}`, error);
    }
  }

  // Utility function to chunk an array into smaller arrays of a specified size
  function chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
  onUnmounted(stopCrawler);

  // Expose reactive properties and functions
  return {
    siteStatuses,
    addSites,
    startCrawler,
    stopCrawler,
    updateSiteSettings,
  };
}
