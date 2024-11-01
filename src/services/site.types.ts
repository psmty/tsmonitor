import type {ParsedData} from './parser.types.ts';

export enum Environment {
  Dev = 'Dev',
  Prop = 'Prod',
  Trial = 'Trial'
}

export interface SiteSettings {
  customer: string,
  environment: Environment|null,
  csm: string,
  hasIntegration: boolean,
}

export interface SitesData {
  url: string;
  settings: SiteSettings|null
}

export interface Site extends SiteSettings {
  url: string;
  online: boolean;
  lastChecked: Date | null;
  processedData: ParsedData | null; // TODO: Why do we need processedData
}