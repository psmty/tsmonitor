import type {
  ServerInfo,
  DocumentInfo,
  VersionInfo,
  LicenseInfo, ParsedData
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
        licenseInfo["dl"] = dlMatch[1];
      }
    } else if (key === "sg" || key === "ts") {
      // Split `sg` or `ts` values into an array of numbers
      licenseInfo[key] = value.split("/").map((num) => parseInt(num, 10));
    } else if (key === "pr") {
      licenseInfo[key] = value.split(",");
    } else if (key === "fu") {
      licenseInfo[key] = parseInt(value, 10);
    } else if (key === "tr") {
      licenseInfo[key] = parseInt(value, 10);
    }
  });

  return licenseInfo;
}



// Function to find and parse all license fragments in a larger string
function extractLicensesFromString(input: string) {
  const matches = input.match(licenseFragmentRegex);
  if (!matches?.[0]) return undefined; // Return empty array if no license fragments are found

  return parseLicenseLine(matches[0]);
}


function extractTextAfterDate(input = ''): string | null {
  // Regex to match text after "Date:" up to the end of the line
  const dateRegex = /Date:\s*(.*)$/m;

  // Execute the regex to capture the text
  const match = dateRegex.exec(input);

  // Return the captured text, or null if no match found
  return match ? match[1].trim() : null;
}


function services(htmlString: string) {
  const sections = htmlString.split("------------");
  const backend = sections.splice(0, 1)?.[0];

  return {
    date: extractTextAfterDate(backend),
    syncRunning: /Sync service:[\s\S]*?Relative URL:[\s\S]*?Running on\s+Server \d+/g.test(htmlString),
    cleanupRunning: /Cleanup service:\s*SG\.Cleanup\.Service/.test(htmlString),
    insightsRunning: /Advanced Report service:\s*SG\.InsightPlus\.Sync\.Service/.test(htmlString),
    apinotificationRunning: /Api notification service:\s*SGT5\.ApiNotifications\.Service/.test(htmlString),
  };
}

function parsePatchedVersion(htmlString: string) {
  const patchedVersionRegex = /(?:^\s*|\n\s*\n)Version:\s(\d+\.\d+\.\d+\.\d+)[\s\S]*?Date:\s([^\n]+)/g;
  let match;
  let latestPatch = null;

  while ((match = patchedVersionRegex.exec(htmlString)) !== null) {
    const version = match[1];
    const dateStr = match[2].trim();

    // Parse date string into a Date object
    const parsedDate = new Date(dateStr);

    if (!latestPatch || parsedDate > latestPatch.date) {
      latestPatch = { version, date: parsedDate };
    }
  }

  return latestPatch?.version ?? null;
}

export function parseHtmlString(htmlString: string): ParsedData {
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
  const patchedVersion = parsePatchedVersion(htmlString);
  if (patchedVersion) {
    sgt5PublicVersion = patchedVersion;
  } else if ((match = publicVersionRegex.exec(htmlString)) !== null) {
    sgt5PublicVersion = match[1]?.trim();
  }

  return {
    modules,
    uiVersions,
    servers,
    documentInfo,
    sgt5PublicVersion,
    licenseInfo,
    ...services(htmlString),
  };
}
