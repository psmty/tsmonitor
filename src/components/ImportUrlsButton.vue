<template>
  <span>
    <label for="import-urls" data-tooltip-target="import-urls"
           class="inline-flex items-center px-3 py-1.5 text-sm font-sm text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
    >Import from CSV</label>
    <input type="file" accept=".csv" class="hidden" id="import-urls" @change="parseCsv" />
  </span>
</template>

<script setup lang="ts">
import Papa from 'papaparse';
import {
  addDefaultDomainToString,
  addHttpsProtocol,
  type SitesData,
  type SiteSettings,
  validateUrl
} from '../services';
import {DEFAULT_SETTINGS} from '../services/edit.defaults.ts';
import { CustomFieldsName, Environment } from '../services/consts.ts';

const emits = defineEmits<{
  (e: 'saveUrls', urls: SitesData[]): void;
}>();

const getColumns = (data: Array<string>) => {
  const cols: Partial<Record<CustomFieldsName, number>> = {};

  for (const fieldName of Object.values(CustomFieldsName)) {
    const colIndex = data.findIndex((colName) => colName === fieldName);
    if (colIndex >= 1) {
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
   const settings: SiteSettings = {...DEFAULT_SETTINGS};

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
        case CustomFieldsName.Csm:
          settings.csm = rowValue;
          break;
        default:
          throw new Error(`unknown field ${key}`);
      }

    }

    return settings;
}

const parseUrls = (data: string[][]) => {
  const urls: SitesData[] = [];

  const colsIndexes = getColumns(data[0]);

  const urlIndex = colsIndexes[CustomFieldsName.URL];
  if (urlIndex === undefined) {
    return;
  }

  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    if (!row[urlIndex]) {
      continue;
    }

    const url: string | null = correctUrlString(row[urlIndex]);

    if (!url) {
      continue;
    }

    const settings = parseSettings(colsIndexes, row);

    urls.push({url, settings})
  }

  return urls;
};


const parseCsv = (e: Event & { target: HTMLInputElement }) => {
  const file = e.target.files?.[0];

  if (!file) {
    return;
  }

  Papa.parse<string[], File>(file, {
    complete(results) {
      const urls = parseUrls(results.data);

      if (!urls) {
        return;
      }

      emits('saveUrls', urls);
    },
    error(res) {
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
