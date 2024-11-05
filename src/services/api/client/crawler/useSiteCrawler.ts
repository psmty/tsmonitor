import {onMounted, onUnmounted, ref} from 'vue';
import type {CrawlerParsed, ParsedData} from '../../../parser.types.ts';
import type {Site, SitesData} from '../../../site.types.ts';
import {DEFAULT_SETTINGS} from '../../../edit.defaults.ts';

export const useSiteCrawler = () => {
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
        ...{...DEFAULT_SETTINGS, ...(newSite.settings ?? {})},
        ...(newSite.parsedData ?? {})
      });
    });
  };

  const updateSiteSettings = ({settings, url}: SitesData) => {
    if (!siteStatuses.value.has(url)) {
      console.error(`${url} is not exists`)
      return;
    }

    const currentData = siteStatuses.value.get(url)!;
    siteStatuses.value.set(url, {...currentData, ...settings});
  }

  const deleteSites = (urls: string[]) => {
    urls.forEach(url => siteStatuses.value.delete(url));
  };

  const loadSites = async (sites: SitesData[]) => {
    try {
      initSites(sites);
      const response = await fetch("/api/crawler", {
        method: "POST",
        body: JSON.stringify(sites)
      });

      if (!response.ok) {
        throw new Error(`Update failed with status ${response.status}`);
      }

      const parsedData: CrawlerParsed[] = await response.json();
      saveSiteStatuses(parsedData);
    } catch (error) {
      console.error(`Failed to update sites`, error);
    }
  };

  const initSites = (sites: SitesData[]) => {
    sites.forEach(site => {
      siteStatuses.value.set(site.url, {
        url: site.url,
        online: false,
        lastChecked: null,
        ...DEFAULT_SETTINGS
      })
    })
  }

  const startCrawler = () => {
    if (eventSource) {
      stopCrawler();
    }

    eventSource = new EventSource('/api/crawler');

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
    deleteSites,
    loadSites,
    updateSiteSettings
  };
};
