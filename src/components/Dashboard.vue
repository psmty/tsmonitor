<template>
  <div
    class="flex flex-col grow bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 dark:bg-gray-800"
  >
    <ImportUrlsButton @saveUrls="saveUrlsToDataBase" class="my-5 mx-5" />
    <Grid :data="source" @editRow="editRow"/>

    <SideBar v-model="visibleSideBar">
      <template #title>Update row</template>

      <div>Some test</div>
    </SideBar>
  </div>
</template>

<script setup lang="ts">
import Grid from "./Grid.vue";
import ImportUrlsButton from "./ImportUrlsButton.vue";
import {computed, onBeforeUnmount, onMounted, ref} from "vue";
import { useCrawler } from './useCrawler';
import SideBar from './SideBar.vue';

const { siteStatuses, addSites, startCrawler, } = useCrawler();

const visibleSideBar = ref(false);

onMounted(async () => {
  const response = await fetch("/api/list");
  const sites = await response.json();
  startCrawler(sites.map((site: { url: string }) => site.url));
});

let interval: NodeJS.Timeout | null = null;

const source = computed(() => {
  return [...siteStatuses.value.values()];
})

const saveUrlsToDataBase = async (urls: string[]) => {
  const response = await fetch("/api/list", {
    method: "POST",
    body: JSON.stringify(urls),
  });

  const newAddedUrls = await response.json();
  addSites(newAddedUrls);
};

onBeforeUnmount(() => {
  if (interval) {
    clearInterval(interval);
  }
});

const editRow = (rowIndex: number) => {
  visibleSideBar.value = true;
}
</script>
