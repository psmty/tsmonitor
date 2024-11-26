import type {ParsedData} from './parser.types.ts';


export interface SiteSettings extends Partial<ParsedData> {
  customer: string,
  environment: string|null,
  hasIntegration: boolean,
  resource?: string
}

export interface SitesData {
  url: string;
  online?: boolean
  pingat?: Date
  settings: Partial<SiteSettings>|null
}

export interface Site extends SiteSettings, Pick<SitesData, 'online' | 'pingat'> {
  url: string;
}
