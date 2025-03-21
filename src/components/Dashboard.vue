<template>
  <div
    class="flex flex-col grow bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div class="flex items-center justify-between my-5 mx-5">
      <div class="flex flex-row space-x-4">
        <SelectionCount :max="visibleSourceCount" :selected="selectedRows.size" />
        <TsButton @click="expandAll"><ExpandIcon :is-collapse="isExpanded" style="width: 10px;" /></TsButton>
        <TsButton @click="startChoosingColumn">Choose columns</TsButton>
        <Select :key="'group-by'" :source="groupByOptions" v-model:value="groupBy" prefix="Group by" />
        <Select :key="'highlight-version'" :source="versionOptions" v-model:value="highlightVersion" prefix="Version highlight" />
        <Search v-model="search" />
      </div>
      <div class="flex flex-row space-x-4">

        <TsButton color="green" @click="addNewUrl">Add Url</TsButton>
        <ImportUrlsButton @saveUrls="addSites" />
        <button
          class="inline-flex items-center px-3 py-1.5 text-sm font-sm text-center text-gray-500 items-center bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-lg border border-gray-200 text-sm font-medium hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
          @click="exportToCsv">
          Export to CSV
        </button>
      </div>
    </div>
    <Grid ref="grid" :columns="columns" :data="source" :selected-rows="selectedRows" :grouping="grouping" :loading-urls="loadingUrls" :grid-filters="savedGridFilters"
          @editRow="startEditRow" @delete-row="startDeleteRow" @update-row="editRow" @reload-row="callReloadUrl" @sync-filter="syncFilters" @updateRowCount="setSourceCount" @colReorder="saveColumnOrder"/>

    <SideBar v-model="visibleSideBar" @onHide="onHideSidebar">
      <template #title>{{ sideBarTitle }}</template>

      <EditRowFields v-if="sideBarType === SideBarType.Edit" :visible="visibleSideBar" :editUrls="editUrls"
                     :source="siteStatuses" @create="createRow" @update="editRow" @closePopup="hideSidebar"
                     :resources="props.resources" />

      <DeleteRowConfirmation v-else-if="sideBarType === SideBarType.Delete" :urls="deleteUrls" @close="hideSidebar"
                             @delete="deleteRow" />

      <ChooseColumn v-else-if="sideBarType === SideBarType.ChooseColumn" v-model.selectedItems="selectedColumns"
                    :source="columnSelectorSource" />
    </SideBar>
  </div>
</template>

<script setup lang="ts">
import ExpandIcon from "./icons/ExpandIcon.vue";
import Grid from "./Grid.vue";
import ImportUrlsButton from "./ImportUrlsButton.vue";
import Select from './select/Select.vue';
import {computed, ref } from "vue";
import {useDashboardApi} from '../composables/useDashboard.ts';
import SideBar from './SideBar.vue';
import EditRowFields from './EditRowFields.vue';
import {type SitesData, groupBy as groupByKey, type Site} from '../services';
import DeleteRowConfirmation from './DeleteRowConfirmation.vue';
import {SideBarType, useSideBar} from '../composables/useSideBar.ts';
import {useEditRow} from '../composables/useEditRow.ts';
import {useDeleteConfirmation} from '../composables/useDeleteConfirmation.ts';
import {YES_NO, YES_NO_OPT} from "./grid.columns.ts";
import type {ColumnProp, GroupingOptions, MultiFilterItem} from "@revolist/vue3-datagrid";
import {EMPTY_ID, type SelectSource} from './select/defaults.ts';
import {type MainGridPersonalization, usePersonalization} from '../composables/usePersonalization.ts';
import {useChooseColumn} from '../composables/useChooseColumn.ts';
import ChooseColumn from './ChooseColumn.vue';
import SelectionCount from './SelectionCount.vue';
import TsButton from './TsButton.vue';
import Search from './Search.vue';
import {convertGridSiteToServerSiteData} from '../services/edit.helpers.ts';

const props = defineProps({
  resources: {
    type: Array as () => string[],
    default: () => []
  }
});

const search = ref('');
const visibleSourceCount = ref(0);

const {personalization, setPersonalizationValue} = usePersonalization<MainGridPersonalization>('mainGrid');
const {siteStatuses, loadingUrls, deleteSites, addSites, updateSites, loadSites} = useDashboardApi();

const {visibleSideBar, sideBarType, sideBarTitle, hideSidebar, clearSideBarType} = useSideBar();
const {editUrls, startEditRow, endEditRow} = useEditRow(visibleSideBar, sideBarType, sideBarTitle);
const {deleteUrls, startDeleteRow, endDeleteRow} = useDeleteConfirmation(visibleSideBar, sideBarType, sideBarTitle);
const {
  startChoosingColumn,
  columns,
  selectedColumns,
  gridColumnsSource,
  columnSelectorSource,
  highlightVersion,
} = useChooseColumn<MainGridPersonalization>(visibleSideBar, sideBarType, sideBarTitle, personalization, setPersonalizationValue, props.resources);

const selectedRows = ref(new Set<string>());
const groupByOptions = computed<SelectSource[]>(() => {
  return [
    {value: 'None', id: EMPTY_ID},
    ...gridColumnsSource.map((column) => ({value: column.name, id: column.name})).sort((a, b) => a.value.localeCompare(b.value))
  ];
});

const versionOptions = computed<SelectSource[]>(() => {
  const vals = [...siteStatuses.value.values()].reduce((r, v) => { if (v.sgt5PublicVersion) r.add(v.sgt5PublicVersion); return r; }, new Set<string>())
  return [
    {value: 'Highlight version', id: EMPTY_ID},
    ...[...vals].map((v) => ({value: v, id: v})).sort((a, b) => b.value.localeCompare(a.value))
  ];
});
const groupBy = computed({
  get: () => personalization.value?.groupBy ?? EMPTY_ID,
  set: (value) => setPersonalizationValue('groupBy', value)
});
const selectedGroupedRows = computed(() => {
  if (!groupBy.value || groupBy.value === EMPTY_ID) {
    return null;
  }

  const column = gridColumnsSource.find((column) => column.name === groupBy.value);
  if (!column) {
    return null;
  }

  const prop = column.prop as keyof Site;
  return groupByKey(source.value, (item) => String(item[prop] ?? ''), (item) => item.url);
});
const selectedGroupedRowsCount = computed(() => {
  if (selectedGroupedRows.value === null) {
    return null;
  }

  let counts: Record<string, { selected: number, length: number }> = {};

  Object.keys(selectedGroupedRows.value).forEach(key => {
    const values = selectedGroupedRows.value![key];
    const length = values.length;
    const selected = values.reduce((count, val) => {
      return count + (selectedRows.value.has(val) ? 1 : 0);
    }, 0);

    counts[key] = { selected, length}
  })

  return counts;
})

const isExpanded = ref(false);
let collapseAll = false;

const expandAll = () => {
  if (isExpanded.value) {
    collapseAll = true;
  }
  isExpanded.value = !isExpanded.value;
}

const grouping = computed((): GroupingOptions | undefined => {
  if (!groupBy.value) return;

  const column = gridColumnsSource.find((column) => column.name === groupBy.value);
  if (!column) {
    return;
  }

  return {
    props: [column.prop],
    prevExpanded: collapseAll ? {} : undefined,
    expandedAll: isExpanded.value,
    groupLabelTemplate: (h, props) => {
      const attributes = {class: 'ml-2 flex items-center gap-4 h-full'};
      const expanded = props.expanded;
      const chevron = h('div', {class: `chevron ${expanded ? 'chevron-down' : 'chevron-right'}`}, '');

      const selectedGroupCounts = selectedGroupedRowsCount.value?.[props.name ?? ''];
      const groupLabel = h('div', {class: `bg-gray-100 text-gray-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300 flex items-center`}, `${selectedGroupCounts?.selected ?? 0} / ${selectedGroupCounts?.length ?? 0}`);

      if (column.cellTemplate === YES_NO_OPT || column.cellTemplate === YES_NO) {
        return h('div', attributes, [chevron, YES_NO_OPT(h, {value: props.name, type: 'rgRow'}) || null]);
      }

      return h('div', attributes, [chevron, h('span', {}, props.name ?? 'EMPTY'), groupLabel]);
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

  if (highlightVersion.value) {
    // refresh the highlight version
  }

  if (!search.value) {
    return options;
  }

  // TODO: Refactor the search to use only Revo filters and not modify the original data source.
  return options.filter((item) => {
    const predicate = search.value.toLowerCase();

    return item.url.toLowerCase().includes(predicate) || item.customer.toLowerCase().includes(predicate);
  });
});

const createRow = async (sites: SitesData[]) => {
  hideSidebar();
  await addSites(sites);
};

const editRow = async (editFields: SitesData[]) => {
  hideSidebar();
  await updateSites(editFields);
};

const deleteRow = async (urls: string[]) => {
  await deleteSites(urls);
  selectedRows.value.clear();
  hideSidebar();
};

const addNewUrl = () => startEditRow();

const callReloadUrl = async (url: string) => {
  const site = siteStatuses.value.get(url);

  if (!site) {
    throw new Error(`Site ${url} does not exist!`);
  }

  await loadSites([convertGridSiteToServerSiteData(site)], false, true)
}

const savedGridFilters = computed<string>(() => {
  return personalization.value?.gridFilters ?? ''
});

const syncFilters = (filters: string) => {
  setPersonalizationValue('gridFilters', filters)
}

const setSourceCount = (count: number) => {
  selectedRows.value.clear();
  visibleSourceCount.value = count;
}

const saveColumnOrder = (order: ColumnProp[]) => {
  setPersonalizationValue('columnOrder', order)
}


const grid = ref<(typeof Grid | null)>(null);
const exportToCsv = () => {
  grid.value?.exportToCSV();
};
</script>
