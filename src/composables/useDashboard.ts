import {onMounted, onUnmounted, ref} from "vue";
import type {CrawlerParsed} from "../services/parser.types.ts";
import type {LicenseInfo, Site, SitesData} from "../services/site.types.ts";
import {DEFAULT_SETTINGS} from "../services/edit.defaults.ts";
import {useLoader} from './useLoader.ts';
import axios from '../services/api/axios.ts';

export const useDashboardApi = () => {
  const {showLoader} = useLoader();

  let eventSource: EventSource | null = null;

  const siteStatuses = ref(new Map<string, Site & LicenseInfo>());
  const loadingUrls = ref(new Set<string>());

  const saveSiteStatuses = (parsedSites: CrawlerParsed[]) => {
    parsedSites.forEach((newSite) => {
      loadingUrls.value.delete(newSite.url);
      const site = siteStatuses.value.get(newSite.url);
      const licenseInfo = newSite.parsedData?.licenseInfo;
      const license: LicenseInfo = {
        daysLeft: licenseInfo?.dl,
        sgTotalResource: licenseInfo?.sg?.[0] ?? '-',
        sgEnabledResource: licenseInfo?.sg?.[1] ?? '-',
        sgUsers:
          ((licenseInfo?.sg?.[3] || 0) -
            (licenseInfo?.sg?.[0] || 0)) || '-',
        sgEnabledResourceWithCredentials:
          licenseInfo?.sg?.[2] || '-',
        sgTeamResource: licenseInfo?.tr || '-',
        licenseLimit: licenseInfo?.sg?.[3] || '-',
        tsTotalResource: licenseInfo?.ts?.[0] || '-',
        tsEnabledResource: licenseInfo?.ts?.[1] || '-',
        tsUsers:
          (licenseInfo?.ts?.[1] || 0) -
          (licenseInfo?.ts?.[0] || 0) || '-'
      };
      const result: Site & LicenseInfo = {
        ...(site ?? {}),
        pingat: newSite.pingat ?? new Date(),
        online: newSite.online,
        url: newSite.url,
        ...{...DEFAULT_SETTINGS, ...(newSite.settings ?? {})},
        ...(newSite.parsedData ?? {}),
        ...(newSite.settings ?? {}),
        sgt5PublicVersion: newSite.parsedData?.sgt5PublicVersion?.trim() || "-",
        ...license
      };
      siteStatuses.value.set(newSite.url, result);
    });
  };

  const updateSiteSettings = (sites: SitesData[]) => {
    sites.forEach(({url, settings, newUrl}) => {
      if (!siteStatuses.value.has(url)) {
        console.error(`${url} is not exists`);
        return;
      }

      const setUrl = newUrl ? newUrl : url;
      const currentData = siteStatuses.value.get(url)!;
      if (!!newUrl) {
        siteStatuses.value.delete(url);
      }
      siteStatuses.value.set(setUrl, {...currentData, ...settings, url: setUrl});
    });
  };

  const addSites = async (urls: SitesData[]) => {
    const newAddedUrls: SitesData[] | null = await axios.post("/api/list", urls);
    if (newAddedUrls === null) {
      console.warn("No new sites have been added.");
      return;
    }
    await loadSites(newAddedUrls);
  };

  const deleteSites = async (urls: string[]) => {
    const deletedRows: { rowCount: number } = await axios.delete("/api/list", {data: urls});
    if (deletedRows.rowCount > 0) {
      urls.forEach((url) => siteStatuses.value.delete(url));
    }
  };

  const loadSites = async (sites: SitesData[], isUpdate = true, force = false) => {
    if (eventSource === null) {
      return;
    }

    try {
      sites.forEach(({url}) => loadingUrls.value.add(url));

      if (isUpdate) {
        saveSiteStatuses(sites);
      }
      await axios.post("/api/crawler", {
        sites,
        force
      });
    } catch (error) {
      console.error(`Failed to update sites`, error);
    }
  };

  const updateSites = async (editFields: SitesData[]) => {
    const sitesData: Array<SitesData> | null = await axios.put("/api/list", editFields);
    if (!sitesData) {
      return;
    }
    updateSiteSettings(sitesData);
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
      // Reconnect
      startCrawler();
    };
  };

  const stopCrawler = () => {
    eventSource?.close();
    eventSource = null;
    siteStatuses.value.clear();
  };

  onMounted(async () => {
    showLoader(true);
    const sites: SitesData[]|null = await axios.get("/api/list");
    if (sites === null) { return; }
    saveSiteStatuses(sites);
    startCrawler();
    showLoader(false);
  });

  onUnmounted(() => {
    stopCrawler();
  });
  return {
    siteStatuses,
    loadingUrls,
    addSites,
    loadSites,
    updateSites,
    deleteSites
  };
};
