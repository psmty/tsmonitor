import {DEFAULT_SETTINGS} from './edit.defaults.ts';
import type {LicenseInfo, Site, SitesData} from './site.types.ts';

export function isCustomField(prop: string) {
  return Object.hasOwnProperty.call(DEFAULT_SETTINGS, prop);
}

export function convertGridSiteToServerSiteData(site: Site & LicenseInfo): SitesData {
  return {
    url: site.url,
    online: site.online,
    pingat: site.pingat,
    settings: {
      customer: site.customer,
      environment: site.environment,
      hasIntegration: site.hasIntegration,
      resource: site.resource,
    }
  }
}
