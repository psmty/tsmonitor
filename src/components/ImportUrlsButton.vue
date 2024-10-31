<template>
  <input type="file" accept=".csv" @change="parseCsv"/>
</template>

<script setup lang="ts">
import Papa from 'papaparse';
import {addHttpsProtocol, validateUrl} from '../services';

const emits = defineEmits<{
  (e: 'loadUrls'): void;
}>()

const parseUrls = (data: string[][]) => {
  const urls: string[] = [];

  for (const item of data) {
    const url = item[0];

    if (!validateUrl(url)) {
      continue;
    }

    urls.push(addHttpsProtocol(url))
  }

  return urls;
}

const saveUrlsToDataBase = async (data: string[][]) => {
  const urls = parseUrls(data);
  const response = await fetch("/api/list", {
    method: 'POST', body: JSON.stringify(urls)
  });
  console.log(response, 'urls');
}

const parseCsv = (e: Event & {target: HTMLInputElement}) => {
  const file = e.target.files?.[0];

  if (!file) {
    return;
  }

  Papa.parse<string[], File>(file, {
    complete(results) {
      saveUrlsToDataBase(results.data);
    },
    error(res) {
      console.error(res);
    }
  })
}
</script>

<style scoped>

</style>
