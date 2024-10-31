import type { ParsedData, VersionInfo } from "./versions.types";



function parseVersionInfo(section: string): VersionInfo {
  const versionMatch = section.match(/Version:\s*(.+)/);
  const relativeURLMatch = section.match(/Relative URL:\s*(\S+)/);
  const revisionMatch = section.match(/Revision:\s*(\S+)/);
  const dateMatch = section.match(/Date:\s*([^\n]+)/);
  const latestOriginRevisionMatch = section.match(
    /Latest Origin Revision:\s*(\S+)/
  );
  const serverMatch = section.match(/Running on Server (\S+)/);

  return {
    version: versionMatch ? versionMatch[1] : "",
    relativeURL: relativeURLMatch ? relativeURLMatch[1] : "",
    revision: revisionMatch ? revisionMatch[1] : "",
    date: dateMatch ? dateMatch[1].trim() : "",
    latestOriginRevision: latestOriginRevisionMatch
      ? latestOriginRevisionMatch[1]
      : "",
    server: serverMatch ? serverMatch[1] : undefined,
  };
}

export function parseString(input: string): ParsedData {
  const sections = input.split("------------\r\n");
  const parsedData: ParsedData = {
    url: "",
    servers: [],
    sgUI: "",
    tempusUI: "",
    syncService: "",
    bwServerTime: "",
    scheduledTasks: "",
    externalSyncService: "",
    externalSyncServerTime: "",
    cleanupService: "",
    apiNotificationService: "",
    advancedReportService: "",
    serversOnline: "",
    sgt5PublicVersion: "",
    licenseInfo: "",
  };

  for (let section of sections) {
    section = section.trim();

    if (section.startsWith("Version:")) {
      const parsedVersion = parseVersionInfo(section);
      parsedData.servers.push(parsedVersion);
    } else if (section.startsWith("SG UI")) {
      parsedData.sgUI += section;
    } else if (section.startsWith("Tempus UI")) {
      parsedData.tempusUI += section;
    } else if (section.startsWith("Sync service")) {
      parsedData.syncService += section;
    } else if (section.startsWith("BW Server Time")) {
      parsedData.bwServerTime = section;
    } else if (section.match(/Eastern Standard Time|UTC/)) {
      parsedData.scheduledTasks += section;
    } else if (section.startsWith("External Sync service")) {
      parsedData.externalSyncService += section;
    } else if (section.startsWith("External Sync Server Time")) {
      parsedData.externalSyncServerTime = section;
    } else if (section.startsWith("Cleanup service")) {
      parsedData.cleanupService += section;
    } else if (section.startsWith("Api notification service")) {
      parsedData.apiNotificationService += section;
    } else if (section.startsWith("Advanced Report service")) {
      parsedData.advancedReportService += section;
    } else if (section.match(/^Server \d+/)) {
      parsedData.serversOnline += section;
    } else if (section.startsWith("SGT5 Public Version")) {
      const versionMatch = section.match(/SGT5 Public Version:\s*(.+)/);
      parsedData.sgt5PublicVersion = versionMatch ? versionMatch[1] : "";
    } else if (section.startsWith("[l:")) {  // Check for license info
      parsedData.licenseInfo = section;
    }
  }

  return parsedData;
}
