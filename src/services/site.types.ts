import type {ParsedData} from './parser.types.ts';


export interface SiteSettings extends Partial<ParsedData> {
  customer: string,
  environment: string|null,
  csm: string,
  hasIntegration: boolean,
  resource?: string
}

export interface SitesData {
  url: string;
  settings: SiteSettings|null
}

export interface Site extends SiteSettings {
  url: string;
  online: boolean;
  lastChecked: Date | null;
}
