<template>
  <span>
    <label for="import-urls" data-tooltip-target="tooltip-import-urls" class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
    >Import from CSV</label>
    <input type="file" accept=".csv" class="hidden" id="import-urls" @change="parseCsv" />
  </span>
</template>

<script setup lang="ts">
import Papa from 'papaparse';
import {addDefaultDomainToString, addHttpsProtocol, validateUrl} from '../services';

const emits = defineEmits<{
  (e: 'saveUrls', urls: string[]): void;
}>();

const parseUrls = (data: string[][]) => {
  const urls: string[] = [];

  for (const item of data) {
    let url: string | null = item[0];

    if (!validateUrl(url)) {
      url = addDefaultDomainToString(url);
    }

    if (url === null) {
      continue;
    }

    urls.push(addHttpsProtocol(url));
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
