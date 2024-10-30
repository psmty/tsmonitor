export interface VersionInfo {
  version: string;
  relativeURL: string;
  revision: string;
  date: string;
  latestOriginRevision: string;
  server?: string;
}

export interface ParsedData {
  servers: VersionInfo[];
  sgUI: string;
  tempusUI: string;
  syncService: string;
  bwServerTime: string;
  scheduledTasks: string;
  externalSyncService: string;
  externalSyncServerTime: string;
  cleanupService: string;
  apiNotificationService: string;
  advancedReportService: string;
  serversOnline: string;
  sgt5PublicVersion: string;
  licenseInfo: string;
}
