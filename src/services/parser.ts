import { parse } from "vue/compiler-sfc";
import type {
  ServiceInfo,
  ServerInfo,
  DocumentInfo,
  VersionInfo,
  LicenseInfo,
} from "./parser.types";

const licenseFragmentRegex = /\[l:dl=[^\]]+\]/g;

// Function to parse each license line
function parseLicenseLine(line: string) {
  const segments = line.replace(/^\[|\]$/g, "").split(";");

  // Build an object by splitting each segment at `:`
  const licenseInfo: Partial<LicenseInfo>  = {};

  segments.forEach((segment) => {
    const [key, value] = segment.split(":");

    // Special handling for `pr` (products list)
    if (key === "l") {
      // Extract only the number from `dl`
      const dlMatch = value.match(/dl=(\d+)/);
      if (dlMatch) {
        licenseInfo["dl"] = parseInt(dlMatch[1], 10);
      }
    } else if (key === "sg" || key === "ts") {
      // Split `sg` or `ts` values into an array of numbers
      licenseInfo[key] = value.split("/").map((num) => parseInt(num, 10));
    } else if (key === "pr") {
      licenseInfo[key] = value.split(",");
    } else if (key === "fu") {
      licenseInfo[key] = parseInt(value, 10);
    }
  });

  return licenseInfo;
}

function parseServiceEntry(serviceEntry: string) {
  const serviceTypeRegex = /(\w+ service):\n\n(.*?)\n/;
  const metadataRegex = /Relative URL: (.*?)\nRevision: (.*?)\nDate: (.*?)\n/;
  const revisionAndServerRegex = /Latest Origin Revision: (.*?)\nRunning on (.*?)\n/;
  // 1. Match Service Type and Description
  const serviceTypeMatch = serviceEntry.match(serviceTypeRegex);
  const serviceName = serviceTypeMatch ? serviceTypeMatch[1] : null;
  const description = serviceTypeMatch ? serviceTypeMatch[2] : null;

  // 2. Match Metadata
  const metadataMatch = serviceEntry.match(metadataRegex);
  const relativeUrl = metadataMatch ? metadataMatch[1] : null;
  const revision = metadataMatch ? metadataMatch[2] : null;
  const date = metadataMatch ? metadataMatch[3] : null;

  // 3. Match Latest Origin Revision and Running Server
  const revisionAndServerMatch = serviceEntry.match(revisionAndServerRegex);
  const latestOriginRevision = revisionAndServerMatch ? revisionAndServerMatch[1] : null;
  const runningOnServer = revisionAndServerMatch ? revisionAndServerMatch[2] : null;

  // Constructing the result object
  return {
      serviceName,
      description,
      relativeUrl,
      revision,
      date,
      latestOriginRevision,
      runningOnServer
  };
}


// Function to find and parse all license fragments in a larger string
function extractLicensesFromString(input: string) {
  const matches = input.match(licenseFragmentRegex);
  if (!matches?.[0]) return undefined; // Return empty array if no license fragments are found

  return parseLicenseLine(matches[0]);
}

export function parseHtmlString(htmlString: string) {
  const modules: VersionInfo[] = [];
  const servers: ServerInfo[] = [];
  let documentInfo: DocumentInfo = { totalSizeMB: 0 };
  let uiVersions = { sgUI: "", tempusUI: "" };
  let sgt5PublicVersion = "";

  const moduleRegex =
    /(.*?), Version=(.*?), Culture=(.*?), PublicKeyToken=(.*?)\r?\n/g;


  const serverRegex = /Server (\d+) - Active (\d+) seconds ago/g;
  
  const docSizeRegex = /Total Document Size: (\d+) MB/;

  const tempusUIRegex = /Tempus UI\s*\r?\n\r?\n([a-f0-9]+)\s*\r?\n/i;
  const sgUIRegex = /SG UI\s*\r?\n\r?\n([a-f0-9]+)\s*\r?\n/i;

  const publicVersionRegex = /SGT5 Public Version:\s*(\S+)/;

  // Parse Modules
  let match: RegExpExecArray | null;
  while ((match = moduleRegex.exec(htmlString)) !== null) {
    modules.push({
      name: match[1]?.trim(),
      version: match[2]?.trim(),
      culture: match[3]?.trim(),
      publicKeyToken: match[4]?.trim(),
    });
  }

  // Parse Servers
  while ((match = serverRegex.exec(htmlString)) !== null) {
    servers.push({
      name: `Server ${match[1]}`,
      activeSecondsAgo: parseInt(match[2], 10),
    });
  }

  // Parse License Info
  const licenseInfo = extractLicensesFromString(htmlString);

  // Parse Document Info
  if ((match = docSizeRegex.exec(htmlString)) !== null) {
    documentInfo.totalSizeMB = parseInt(match[1], 10);
  }

  // Parse UI Versions
  if ((match = tempusUIRegex.exec(htmlString)) !== null) {
    uiVersions.sgUI = match[1]?.trim();
  }
  if ((match = sgUIRegex.exec(htmlString)) !== null) {
    uiVersions.tempusUI = match[1]?.trim();
  }

  // Parse SGT5 Public Version
  if ((match = publicVersionRegex.exec(htmlString)) !== null) {
    sgt5PublicVersion = match[1]?.trim();
  }

  return {
    modules,
    uiVersions,
    services: parseServiceEntry(htmlString),
    servers,
    documentInfo,
    sgt5PublicVersion,
    licenseInfo,
    ...(licenseInfo ? {
      sgUsers: (licenseInfo.sg?.[licenseInfo.sg.length - 1] || 0) - (licenseInfo.sg?.[0] || 0),
      tsUsers: (licenseInfo.ts?.[licenseInfo.ts.length - 1] || 0) - (licenseInfo.ts?.[0] || 0),
    } : {}),
  };
}
