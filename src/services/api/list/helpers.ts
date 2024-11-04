import type {SitesData, SiteSettings} from '../../site.types.ts';
import {DEFAULT_SETTINGS} from '../../edit.defaults.ts';

export function getSitesMap(sites: SitesData[] ): Map<string, SitesData> {
  return new Map<string, SitesData>(
    sites.map((sites) => [sites.url, sites])
  );
}

export function getUpdatedSites(newSites: SitesData[], existingSitesMap: Map<string, SitesData>) {
  const addedSites = new Map<string, SitesData>();

  for (const site of newSites) {
    const existingSite = existingSitesMap.get(site.url);

    if (existingSite && existingSite.settings && site.settings) {
      // Create a copy of the existing settings to hold merged values
      const updatedSettings: SiteSettings = { ...existingSite.settings };
      let hasMerged = false;

      const updateSetting = <K extends keyof SiteSettings>(key: K) => {
        const hasExistingSetting = existingSite.settings![key] !== DEFAULT_SETTINGS[key];
        const hasNewSetting = site.settings![key] !== DEFAULT_SETTINGS[key];
        if (!hasExistingSetting && hasNewSetting) {
          updatedSettings[key] = site.settings![key];
          hasMerged = true;
        }
      };

      // Update only fields in existingSite that match the default values
      for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[]) {
        updateSetting(key);
      }

      // Only add to addedSites if there was at least one merged field
      if (hasMerged) {
        addedSites.set(existingSite.url, {
          ...existingSite,
          settings: updatedSettings
        });
      }
    } else if (existingSite && existingSite.settings === null && site.settings) {
      // If there is no default settings in existingSite
      addedSites.set(existingSite.url, {
        ...existingSite,
          settings: site.settings
      })
    } else if (!existingSite) {
      // If the site is not in existingSitesMap, add it as a new entry
      addedSites.set(site.url, site);
    }
  }

  return Array.from(addedSites.values());
}
