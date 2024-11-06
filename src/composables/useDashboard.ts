import { onMounted, onUnmounted, ref } from "vue";
import type { CrawlerParsed } from "../services/parser.types.ts";
import type { Site, SitesData } from "../services/site.types.ts";
import { DEFAULT_SETTINGS } from "../services/edit.defaults.ts";

export const useDashboardApi = () => {
  let eventSource: EventSource | null = null;

  const siteStatuses = ref(new Map<string, Site>());

  const saveSiteStatuses = (parsedSites: CrawlerParsed[]) => {
    parsedSites.forEach((newSite) => {
      const site = siteStatuses.value.get(newSite.url);
      siteStatuses.value.set(newSite.url, {
        ...(site ?? {}),
        lastChecked: new Date(),
        url: newSite.url,
        online: newSite.online,
        ...{ ...DEFAULT_SETTINGS, ...(newSite.settings ?? {}) },
        ...(newSite.parsedData ?? {}),
      });
    });
  };

  const updateSiteSettings = ({ settings, url }: SitesData) => {
    if (!siteStatuses.value.has(url)) {
      console.error(`${url} is not exists`);
      return;
    }

    const currentData = siteStatuses.value.get(url)!;
    siteStatuses.value.set(url, { ...currentData, ...settings });
  };

  const addSites = async (urls: SitesData[]) => {
    const response = await fetch("/api/list", {
      method: "POST",
      body: JSON.stringify(urls)
    });
  
    const newAddedUrls: SitesData[] | null = await response.json();
    if (newAddedUrls === null) {
      console.warn('No new sites have been added.')
      return;
    }
    await loadSites(newAddedUrls);
  };

  const deleteSites = async (urls: string[]) => {
    const response = await fetch("/api/list", {
      method: "DELETE",
      body: JSON.stringify(urls)
    });
    const deletedRows: { rowCount: number } = await response.json();
    if (deletedRows.rowCount > 0) {
      urls.forEach((url) => siteStatuses.value.delete(url));
    }
  };

  const loadSites = async (sites: SitesData[]) => {
    if (eventSource === null) {
      return;
    }

    try {
      initSites(sites);
      const response = await fetch("/api/crawler", {
        method: "POST",
        body: JSON.stringify(sites),
      });

      if (!response.ok) {
        throw new Error(`Update failed with status ${response.status}`);
      }
    } catch (error) {
      console.error(`Failed to update sites`, error);
    }
  };

  const updateSites = async (editFields: SitesData) => {
    const response = await fetch("/api/list", {
      method: "PUT",
      body: JSON.stringify(editFields),
    });
    const siteData = await response.json();
    updateSiteSettings(siteData);
  };

  const initSites = (sites: SitesData[]) => {
    sites.forEach((site) => {
      siteStatuses.value.set(site.url, {
        url: site.url,
        online: false,
        lastChecked: null,
        ...DEFAULT_SETTINGS,
      });
    });
  };

  const startCrawler = () => {
    if (eventSource) {
      stopCrawler();
    }

    eventSource = new EventSource("/api/crawler");

    eventSource.onmessage = (event) => {
      const eventData: CrawlerParsed[] = JSON.parse(event.data);
      saveSiteStatuses(eventData);
    };

    eventSource.onerror = (e) => {
      console.error("Error with EventSource", e);
      stopCrawler();
    };
  };

  const stopCrawler = () => {
    eventSource?.close();
    eventSource = null;
    siteStatuses.value.clear();
  };

  onMounted(async () => {
    const response = await fetch("/api/list");
    const sites: SitesData[] = await response.json();
    initSites(sites);
    startCrawler();
  });

  onUnmounted(() => {
    stopCrawler();
  });
  return {
    siteStatuses,
    addSites,
    updateSites,
    deleteSites,
  };
};
