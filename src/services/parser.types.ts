import type {SiteSettings} from './site.types.ts';

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
  dl?: number;                // The extracted number from `dl`
  sg?: number[];              // Array of numbers from `sg` (e.g., [248, 172, 255])
  ts?: number[];              // Array of numbers from `ts` (e.g., [0, 0, 0])
  pr?: string[];              // Array of strings from `pr` (e.g., ["sg", "t5", "ts", "api", "sch"])
  fu?: string | number;       // `fu` may be a string like "NA" or a number
};

export interface ServerInfo {
  name: string;
  activeSecondsAgo: number;
}

export interface DocumentInfo {
  totalSizeMB: number;
}

export interface ParsedData {
  htmlString: string,
  modules: VersionInfo[];
  uiVersions: { sgUI: string; tempusUI: string };
  servers: ServerInfo[];
  licenseInfo?: LicenseInfo;
  documentInfo: DocumentInfo;
  sgt5PublicVersion: string;
}

export interface CrawlerParsed {
  url: string;
  settings: SiteSettings|null;
  online: boolean;
  parsedData: ParsedData|null
}
