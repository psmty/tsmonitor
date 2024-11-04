<template>
  <div
    class="flex flex-col grow bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 dark:bg-gray-800"
  >
    <div class="flex items-center justify-between my-5 mx-5">
      <ImportUrlsButton @saveUrls="saveUrlsToDataBase" />
      <button
        class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-gray-500 items-center bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-lg border border-gray-200 text-sm font-medium hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
        @click="exportToCsv"
      >
        Export to CSV
      </button>
    </div>
    <Grid ref="grid" :data="source" @editRow="startEditRow" @delete-row="startDeleteRow" />

    <SideBar
      v-model="visibleSideBar"
      @onHide="onHideSidebar"
    >
      <template #title>{{ sideBarTitle }}</template>

      <EditRowFields
        v-if="sideBarType === SideBarType.Edit"
        :visible="visibleSideBar"
        :editUrl="editUrl"
        :source="siteStatuses"
        @update="editRow"
        @closePopup="hideSidebar"
      />

      <DeleteRowConfirmation
        v-else-if="sideBarType === SideBarType.Delete"
        :urls="deleteUrls"
        @close="hideSidebar"
        @delete="deleteRow"
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
import DeleteRowConfirmation from './DeleteRowConfirmation.vue';
import {SideBarType, useSideBar} from '../composables/useSideBar.ts';
import {useEditRow} from '../composables/useEditRow.ts';
import {useDeleteConfirmation} from '../composables/useDeleteConfirmation.ts';

const {siteStatuses, addSites, startCrawler, updateSiteSettings, deleteSites} = useCrawler();

const {visibleSideBar, sideBarType, sideBarTitle, hideSidebar, clearSideBarType} = useSideBar();
const {editUrl, startEditRow, endEditRow} = useEditRow(visibleSideBar, sideBarType, sideBarTitle);
const {deleteUrls, startDeleteRow, endDeleteRow} = useDeleteConfirmation(visibleSideBar, sideBarType, sideBarTitle);

onMounted(async () => {
  const response = await fetch("/api/list");
  const sites = await response.json();
  startCrawler(sites);
});

const onHideSidebar = () => {
  switch (sideBarType.value) {
    case SideBarType.Edit:
      endEditRow();
      break;
    case SideBarType.Delete:
      endDeleteRow();
      break;
  }
  clearSideBarType();
};

let interval: NodeJS.Timeout | null = null;

const source = computed(() => {
  return [...siteStatuses.value.values()];
});

const saveUrlsToDataBase = async (urls: SitesData[]) => {
  const response = await fetch("/api/list", {
    method: "POST",
    body: JSON.stringify(urls)
  });

  const newAddedUrls = await response.json();
  addSites(newAddedUrls);
};

onBeforeUnmount(() => {
  if (interval) {
    clearInterval(interval);
  }
});

const editRow = async (editFields: SitesData) => {
  visibleSideBar.value = false;
  const response = await fetch("/api/list", {
    method: "PUT",
    body: JSON.stringify(editFields)
  });
  const siteData = await response.json();
  updateSiteSettings(siteData);
};

const deleteRow = async (urls: string[]) => {
  const response = await fetch("/api/list", {
    method: "DELETE",
    body: JSON.stringify(urls)
  });
  const deletedRows: { rowCount: number } = await response.json();
  if (deletedRows.rowCount > 0) {
    deleteSites(urls);
  }
  visibleSideBar.value = false;
};

const grid = ref<(typeof Grid | null)>(null);
const exportToCsv = () => {
  grid.value?.exportToCSV();
};
</script>
