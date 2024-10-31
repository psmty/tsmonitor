<template>
  <input type="file" accept=".csv" @change="parseCsv"/>
</template>

<script setup lang="ts">
import Papa from 'papaparse';
import {addDefaultDomainToString, addHttpsProtocol, validateUrl} from '../services';

const emits = defineEmits<{
  (e: 'saveUrls', urls: string[]): void;
}>()

const parseUrls = (data: string[][]) => {
  const urls: string[] = [];

  for (const item of data) {
    let url: string|null = item[0];

    if (!validateUrl(url)) {
      url = addDefaultDomainToString(url);
    }

    if (url === null) {
      continue;
    }

    urls.push(addHttpsProtocol(url))
  }

  return urls;
}


const parseCsv = (e: Event & {target: HTMLInputElement}) => {
  const file = e.target.files?.[0];

  if (!file) {
    return;
  }

  Papa.parse<string[], File>(file, {
    complete(results) {
      const urls = parseUrls(results.data);
      emits('saveUrls', urls)
    },
    error(res) {
      console.error(res);
    }
  })
}
</script>

<style scoped>

</style>
