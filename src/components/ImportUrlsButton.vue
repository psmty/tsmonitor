<template>
  <span v-if="!busy">
    <label for="import-urls" data-tooltip-target="import-urls"
      class="inline-flex items-center px-3 py-1.5 text-sm font-sm text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Import
      from CSV</label>
    <input type="file" accept=".csv" class="hidden" id="import-urls" @change="parseCsv" />
  </span>
  <span v-else
    class="inline-flex items-center px-3 py-1.5 text-sm font-sm text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
    Loading...
    <span v-if="busy" class="ml-2">
      <!-- Spinner SVG icon -->
      <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.964 7.964 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
        </path>
      </svg>
    </span>
  </span>
  <Tooltip :content="`
  <p>Make sure the first row of your CSV file contains the column names, with data organized in the rows below.
    <br/><br/>Intance column defines site links. If entries in the <strong>Instance</strong> column are not in HTTPS format (e.g., <code>mysite</code>),
    they will be treated as aliases and automatically transformed to a valid URL, like <code>https://mysite.tempus-resource.com/sg</code>.</p>
        <br/><p><strong>CSV file example:</strong></p>
        <pre class='bg-gray-700 p-2 rounded text-white text-xs'>
Instance
site1
site2
https://site3.com
</pre>`"
/>
</template>

<script setup lang="ts">
import Tooltip from './Tooltip.vue';
import Papa from 'papaparse';
import {
  addDefaultDomainToString,
  addHttpsProtocol,
  type SitesData,
  type SiteSettings,
  validateUrl
} from '../services';
import { DEFAULT_SETTINGS } from '../services/edit.defaults.ts';
import { CustomFieldsName, Environment } from '../services/consts.ts';
import { ref } from 'vue';

const busy = ref(false);

const emits = defineEmits<{
  (e: 'saveUrls', urls: SitesData[]): void;
}>();

const getColumns = (data: Array<string>) => {
  const cols: Partial<Record<CustomFieldsName, number>> = {};

  for (const fieldName of Object.values(CustomFieldsName)) {
    const colIndex = data.findIndex((colName) => colName?.toLowerCase() === fieldName?.toLowerCase());
    if (colIndex >= 0) {
      cols[fieldName] = colIndex;
    }
  }

  return cols;
};

const correctUrlString = (url: string) => {
  let link: string | null = url;
  if (!validateUrl(link)) {
    link = addDefaultDomainToString(link);
  }

  return link !== null ? addHttpsProtocol(link) : link;
};

function isEnumValue<T extends { [key: string]: string }>(value: string, enumObj: T): value is T[keyof T] {
  return Object.values(enumObj as any).includes(value);
}

const getValidEnvironment = (value: string): Environment | null => {
  const enumValue = isEnumValue(value, Environment);
  if (!enumValue) {
    return null;
  }
  return value;
};

const getBooleanValue = (value: string) => {
  switch (value) {
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      return null;
  }
};

const parseSettings = (colsIndexes: Partial<Record<CustomFieldsName, number>>, row: Array<string>) => {
  const settings: SiteSettings = { ...DEFAULT_SETTINGS };

  for (const key of Object.keys(colsIndexes)) {
    if (key === CustomFieldsName.URL) {
      continue;
    }

    const rowValue = row[colsIndexes[key as CustomFieldsName]!];

    switch (key) {
      case CustomFieldsName.Customer:
        settings.customer = rowValue;
        break;
      case CustomFieldsName.Environment:
        const environmentValue = getValidEnvironment(rowValue);
        if (environmentValue) {
          settings.environment = environmentValue;
        }
        break;
      case CustomFieldsName.Integrations:
        const hasIntegrations = getBooleanValue(rowValue);
        if (hasIntegrations !== null) {
          settings.hasIntegration = hasIntegrations;
        }
        break;
      default:
        throw new Error(`unknown field ${key}`);
    }

  }

  return settings;
}

const parseUrls = (rows: string[][]) => {
  const urls: SitesData[] = [];

  const colsIndexes = getColumns(rows[0]); // first row is header

  const urlIndex = colsIndexes[CustomFieldsName.URL];
  if (urlIndex === undefined) {
    return;
  }

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];

    if (!row[urlIndex]) {
      continue;
    }

    const url: string | null = correctUrlString(row[urlIndex]);

    if (!url) {
      continue;
    }

    const settings = parseSettings(colsIndexes, row);

    urls.push({ url, settings })
  }

  return urls;
};


const parseCsv = (e: Event & { target: HTMLInputElement }) => {
  busy.value = true;
  const file = e.target.files?.[0];

  if (!file) {
    busy.value = false;
    return;
  }

  Papa.parse<string[], File>(file, {
    complete(results) {
      const urls = parseUrls(results.data);
      busy.value = false;
      if (!urls) {
        return;
      }

      emits('saveUrls', urls);
    },
    error(res) {
      busy.value = false;
      console.error(res);
    }
  });
};
</script>

<style scoped>
label[for="import-urls"] {
  cursor: pointer;
}
</style>
