<template>
  <div
    class="flex flex-col grow bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div class="flex items-center justify-between my-5 mx-5">
      <div class="flex flex-row space-x-4">
        <SelectionCount :max="source.length" :selected="selectedRows.size" />
        <button
          class="inline-flex items-center px-3 py-1.5 text-sm font-sm text-center text-gray-900 items-center bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-lg border border-gray-300 hover:text-gray-1000 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
          @click="startChoosingColumn"
        >
          Choose columns
        </button>
        <Select :source="groupByOptions" v-model:value="groupBy" prefix="Group by"/>
        <input type="text"
               class="h-8 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
               v-model="search"
               placeholder="Search...">
      </div>
      <div class="flex flex-row space-x-4">

        <ImportUrlsButton @saveUrls="addSites" />
        <button
          class="inline-flex items-center px-3 py-1.5 text-sm font-sm text-center text-gray-500 items-center bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-lg border border-gray-200 text-sm font-medium hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
          @click="exportToCsv">
          Export to CSV
        </button>
      </div>
    </div>
    <Grid ref="grid" :columns="columns" :data="source" :selected-rows="selectedRows" :grouping="grouping"
          @editRow="startEditRow" @delete-row="startDeleteRow" @update-row="editRow" />

    <SideBar v-model="visibleSideBar" @onHide="onHideSidebar">
      <template #title>{{ sideBarTitle }}</template>

      <EditRowFields v-if="sideBarType === SideBarType.Edit" :visible="visibleSideBar" :editUrl="editUrl"
                     :source="siteStatuses" @update="editRow" @closePopup="hideSidebar" :resources="props.resources" />

      <DeleteRowConfirmation v-else-if="sideBarType === SideBarType.Delete" :urls="deleteUrls" @close="hideSidebar"
                             @delete="deleteRow" />

      <ChooseColumn v-else-if="sideBarType === SideBarType.ChooseColumn" v-model.selectedItems="selectedColumns"
                    :source="columnSelectorSource" />
    </SideBar>
  </div>
</template>

<script setup lang="ts">
import Grid from "./Grid.vue";
import ImportUrlsButton from "./ImportUrlsButton.vue";
import Select from './select/Select.vue';
import {computed, ref} from "vue";
import {useDashboardApi} from '../composables/useDashboard.ts';
import SideBar from './SideBar.vue';
import EditRowFields from './EditRowFields.vue';
import type {SitesData} from '../services';
import DeleteRowConfirmation from './DeleteRowConfirmation.vue';
import {SideBarType, useSideBar} from '../composables/useSideBar.ts';
import {useEditRow} from '../composables/useEditRow.ts';
import {useDeleteConfirmation} from '../composables/useDeleteConfirmation.ts';
import {YES_NO, YES_NO_OPT} from "./grid.columns.ts";
import type {GroupingOptions} from "@revolist/vue3-datagrid";
import {EMPTY_ID, type SelectSource} from './select/defaults.ts';
import {type MainGridPersonalization, usePersonalization} from '../composables/usePersonalization.ts';
import {useChooseColumn} from '../composables/useChooseColumn.ts';
import ChooseColumn from './ChooseColumn.vue';
import SelectionCount from './SelectionCount.vue';

const props = defineProps({
  resources: {
    type: Array as () => string[],
    default: () => []
  }
});

const search = ref('');

const {personalization, setPersonalizationValue} = usePersonalization<MainGridPersonalization>('mainGrid');
const {siteStatuses, deleteSites, addSites, updateSites} = useDashboardApi();

const {visibleSideBar, sideBarType, sideBarTitle, hideSidebar, clearSideBarType} = useSideBar();
const {editUrl, startEditRow, endEditRow} = useEditRow(visibleSideBar, sideBarType, sideBarTitle);
const {deleteUrls, startDeleteRow, endDeleteRow} = useDeleteConfirmation(visibleSideBar, sideBarType, sideBarTitle);
const {
  startChoosingColumn,
  columns,
  selectedColumns,
  gridColumnsSource,
  columnSelectorSource
} = useChooseColumn<MainGridPersonalization>(visibleSideBar, sideBarType, sideBarTitle, personalization, setPersonalizationValue, props.resources);

const selectedRows = ref(new Set<string>());
const groupByOptions = computed<SelectSource[]>(() => {
  return [
    {value: 'Group by', id: EMPTY_ID},
    ...gridColumnsSource.map((column) => ({value: column.name, id: column.name}))
  ];
});
const groupBy = computed({
  get: () => personalization.value?.groupBy ?? EMPTY_ID,
  set: (value) => setPersonalizationValue('groupBy', value)
});
const grouping = computed((): GroupingOptions | undefined => {
  if (!groupBy.value) return;

  const column = gridColumnsSource.find((column) => column.name === groupBy.value);
  if (!column) {
    return;
  }

  return {
    props: [column.prop], groupLabelTemplate: (h, props) => {
      const attributes = {class: 'ml-2 flex items-center gap-4 h-full'};
      const expanded = props.expanded;
      const chevron = h('div', {class: `chevron ${expanded ? 'chevron-down' : 'chevron-right'}`}, '');

      if (column.cellTemplate === YES_NO_OPT || column.cellTemplate === YES_NO) {
        return h('div', attributes, [chevron, YES_NO_OPT(h, {value: props.name, type: 'rgRow'}) || null]);
      }

      return h('div', attributes, [chevron, h('span', {}, props.name ?? 'EMPTY')]);
    }
  };
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

const source = computed(() => {
  const options = [...siteStatuses.value.values()];

  if (!search.value) {
    return options;
  }

  return [...siteStatuses.value.values()].filter((item) => {
    const predicate = search.value.toLowerCase();

    return item.url.toLowerCase().includes(predicate) || item.customer.toLowerCase().includes(predicate);
  });
});

const editRow = async (editFields: SitesData[]) => {
  hideSidebar();
  await updateSites(editFields);
};

const deleteRow = async (urls: string[]) => {
  await deleteSites(urls);
  selectedRows.value.clear();
  hideSidebar();
};

const grid = ref<(typeof Grid | null)>(null);
const exportToCsv = () => {
  grid.value?.exportToCSV();
};
</script>
