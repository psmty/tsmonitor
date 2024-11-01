<template>
  <div
    class="flex flex-col grow bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 dark:bg-gray-800"
  >
    <div class="flex items-center justify-between my-5 mx-5">
      <ImportUrlsButton @saveUrls="saveUrlsToDataBase" />
      <button
        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        @click="exportToCsv"
      >
        Export to CSV
      </button>
    </div>
    <Grid ref="grid" :data="source" @editRow="startEditRow" />

    <SideBar
      v-model="visibleSideBar"
      @onHide="editUrl = null"
    >
      <template #title>Update row</template>

      <EditRowFields
        :visible="visibleSideBar"
        :editUrl="editUrl"
        :source="siteStatuses"
        @update="editRow"
        @closePopup="visibleSideBar = false"
      />
    </SideBar>
  </div>
</template>

<script setup lang="ts">
import Grid from "./Grid.vue";
import ImportUrlsButton from "./ImportUrlsButton.vue";
import {computed, onBeforeUnmount, onMounted, ref} from "vue";
import {useCrawler} from './useCrawler';
import SideBar from './SideBar.vue';
import EditRowFields from './EditRowFields.vue';
import type {SitesData} from '../services';

const {siteStatuses, addSites, startCrawler, updateSiteSettings} = useCrawler();

const visibleSideBar = ref(false);
const editUrl = ref<string | null>(null);

onMounted(async () => {
  const response = await fetch("/api/list");
  const sites = await response.json();
  startCrawler(sites);
});

let interval: NodeJS.Timeout | null = null;

const source = computed(() => {
  return [...siteStatuses.value.values()];
});

const saveUrlsToDataBase = async (urls: string[]) => {
  const response = await fetch("/api/list", {
    method: "POST",
    body: JSON.stringify(urls)
  });

  const newAddedUrls = await response.json();
  // TODO: Update after returning all rows data
  addSites(newAddedUrls);
};

onBeforeUnmount(() => {
  if (interval) {
    clearInterval(interval);
  }
});

const startEditRow = (url: string) => {
  editUrl.value = url;
  visibleSideBar.value = true;
};

const editRow = async (editFields: SitesData) => {
  visibleSideBar.value = false;
  const response = await fetch("/api/list", {
    method: "PUT",
    body: JSON.stringify(editFields)
  });
  const siteData = await response.json();
  updateSiteSettings(siteData);
};

const exportToCsv = () => {

}
</script>
