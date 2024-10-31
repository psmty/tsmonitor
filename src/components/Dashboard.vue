<template>
  <div
    class="flex flex-col grow bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 dark:bg-gray-800"
  >
    <ImportUrlsButton @saveUrls="saveUrlsToDataBase" class="my-5 mx-5 "/>
    <Grid :data="data" @load-source="loadSource"/>
  </div>
</template>

<script setup lang="ts">

import Grid from './Grid.vue';
import ImportUrlsButton from './ImportUrlsButton.vue';
import {onBeforeUnmount, onMounted, ref} from 'vue';
import type {ParsedData} from '../services/versions.types.ts';

onMounted(() => {
    loadSource()
})
const data = ref(new Map<string, ParsedData>());

const crawler = async (urls: string[] = []) => {
    const response = await fetch("/api/crawler", {
        method: 'POST', body: JSON.stringify(urls)});
    const sites: ParsedData[] = await response.json();
    console.log(sites)
    data.value = new Map(sites.map(v => [v.url, v]))
}

let interval: NodeJS.Timeout | null = null
const loadSource = async () => {
    const response = await fetch("/api/list");
    const sites: ParsedData[] = await response.json();
    data.value = new Map(sites.map(v => [v.url, v]))
    const urls: string[] = Array.from(data.value.keys())

    interval = setInterval(() => crawler(urls), 5 * 60 * 1000)
    crawler(urls)
}

const saveUrlsToDataBase = async (urls: string[]) => {
  const response = await fetch("/api/list", {
    method: 'POST', body: JSON.stringify(urls)
  });

  const newAddedUrls = await response.json();
  await crawler(newAddedUrls);
}

onBeforeUnmount(() => {
    if (interval) {
        clearInterval(interval)
    }
})
</script>

<style scoped>

</style>
