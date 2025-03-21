import type {SitesData, SiteSettings} from './site.types.ts';

export interface VersionInfo {
  name: string;
  version: string;
  culture: string;
  publicKeyToken: string;
}

export interface ServiceInfo {
  name: string;
  versions: VersionInfo[];
  relativeUrl: string;
  revision: string;
  date: string;
  latestOriginRevision: string;
  runningOn: string;
}
export type LicenseInfo = {
  dl?: string;                // The extracted number from `dl`
  sg?: number[];              // Array of numbers from `sg` (e.g., [248, 172, 255])
  ts?: number[];              // Array of numbers from `ts` (e.g., [0, 0, 0])
  pr?: string[];              // Array of strings from `pr` (e.g., ["sg", "t5", "ts", "api", "sch"])
  fu?: string | number;       // `fu` may be a string like "NA" or a number
  tr?: string | number;       // `tr` may be a string like "NA" or a number
};

export interface ServerInfo {
  name: string;
  activeSecondsAgo: number;
}

export interface DocumentInfo {
  totalSizeMB: number;
}

export interface ParsedData {
  modules: VersionInfo[];
  uiVersions: { sgUI: string; tempusUI: string };
  servers: ServerInfo[];
  licenseInfo?: LicenseInfo;
  documentInfo: DocumentInfo;
  sgt5PublicVersion: string;
  sgt5PublicVersionMajor: string;
  updatedAt?: string;
}

export interface CrawlerParsed extends SitesData {
  parsedData?: ParsedData|null
}
