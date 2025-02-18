import type {ParsedData} from './parser.types.ts';


export interface SiteSettings extends Partial<ParsedData> {
  customer: string,
  environment: string|null,
  hasIntegration: boolean,
  resource?: string
  url?: string;
}

export interface SitesData {
  url: string;
  online?: boolean
  pingat?: Date
  settings: Partial<SiteSettings>|null,
  newUrl?: string
}

export interface Site extends SiteSettings, Pick<SitesData, 'online' | 'pingat'> {
  url: string;
}


export type LicenseInfo = {
  daysLeft?: string;
  sgTotalResource: number | string;
  sgEnabledResource: number | string;
  sgUsers: number | string;
  sgEnabledResourceWithCredentials: number | string;
  sgTeamResource: number | string;
  licenseLimit: number | string;
  tsTotalResource: number | string;
  tsEnabledResource: number | string;
  tsUsers: number | string;
};
