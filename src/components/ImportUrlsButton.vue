<template>
  <span>
    <label for="import-urls" class="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">Add Urls</label>
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
