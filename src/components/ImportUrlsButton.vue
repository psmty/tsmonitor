<template>
  <input type="file" accept=".csv" @change="parseCsv"/>
</template>

<script setup lang="ts">
import Papa from 'papaparse';
import {addDefaultDomainToString, addHttpsProtocol, validateUrl} from '../services';

const emits = defineEmits<{
  (e: 'loadUrls'): void;
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

const saveUrlsToDataBase = async (data: string[][]) => {
  const urls = parseUrls(data);
  const response = await fetch("/api/list", {
    method: 'POST', body: JSON.stringify(urls)
  });

  const newAddedUrls = await response.json();
  console.log(newAddedUrls, 'urls');
  // TODO: Load urls
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
