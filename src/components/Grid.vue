<template>
  <VGrid
    class="grow rv-grid"
    ref="grid"
    resize
    can-move-columns
    :columns="columns"
    :source="source"
    :exporting="true"
    :grouping="grouping"
    :filter="true"
    hide-attribution
    range
    :theme="theme"
    :plugins="[AdvanceFilterPlugin, RangePlugin, HighlightSelection]"
    :editors="gridEditors"
    :rangePluginEditableColumns.prop="rangePluginEditableColumns"
    :selectedUrls.prop="selectedRows"
    @on-edit-row="onEditRow"
    @on-delete-row="onDeleteRow"
    @on-reload-row="onReloadRow"
    @beforeedit="onCellEdit"
    @beforeautofill="onAutofill"
    @afterfocus="selectCurrentRow"
    @setrange="onShiftSelect"
    @afterfilterapply="syncFilter"
    @aftertrimmed="refreshRowCounter"
    @afteranysource="refreshRowCounter"
  />
</template>
<script lang="ts" setup>
import {
  type ColumnProp,
  type ColumnRegular,
  type ExportFilePlugin,
  type MultiFilterItem,
  VGrid,
  VGridVueTemplate
} from "@revolist/vue3-datagrid";
import {computed, onMounted, ref, toRef, watch, toRaw, nextTick} from "vue";
import {keyBy, localJsDateToDateString, type Site, type SitesData, type SiteSettings} from "../services";
import {CHECKBOX_COLUMN} from "./grid.columns";
import ActionsRenderer from "./gridRenderers/ActionsRenderer.vue";
import {AdvanceFilterPlugin} from './gridPlugins/advanceFilterPlugin/AdvanceFilterPlugin.ts';
import {DEFAULT_SETTINGS} from '../services/edit.defaults.ts';
import {isCustomField} from '../services/edit.helpers.ts';
import {GRID_EDITORS} from './gridEditors/editors.ts';
import {RangePlugin} from './gridPlugins/rangePlugin.ts';
import {HighlightSelection} from './gridPlugins/highlightSelection.ts';

type UpdateRow = { prop: keyof SiteSettings, model: Site, newValue: any };

const grid = ref<{ $el: HTMLRevoGridElement } | null>(null);
const gridEditors = GRID_EDITORS;

interface Props {
  data: Array<Site>;
  columns: ColumnRegular[];
  grouping?: { props: [ColumnProp] };
  selectedRows: Set<string>;
  loadingUrls: Set<string>;
  gridFilters?: string
}

const props = defineProps<Props>();
const emits = defineEmits<{
  (e: "editRow", url: string[]): void;
  (e: "deleteRow", url: string[]): void;
  (e: 'updateRow', sites: Array<SitesData>): void;
  (e: 'reloadRow', site: string): void;
  (e: 'syncFilter', filters: string): void;
  (e: 'updateRowCount', total: number): void;
}>();


const rangePluginEditableColumns = ['customer', 'hasIntegration', 'resource', 'environment'];

const source = computed(() => {
  return props.data.sort((a, b) => a.url.localeCompare(b.url));
});

const columns = computed((): ColumnRegular[] => ([
  CHECKBOX_COLUMN(toRef(props.selectedRows), source),
  {
    name: "",
    prop: "edit",
    size: 100,
    sortable: false,
    filter: false,
    readonly: true,
    // pin: "colPinStart",  // doesn't look good with grouping
    cellProperties: () => ({class: {"edit-cell": true}}),
    cellTemplate: VGridVueTemplate(ActionsRenderer, {loadingUrls: props.loadingUrls})
  },
  ...props.columns
]));
const theme = ref("compact");

const checkTheme = () => {
  if (document.documentElement.classList.contains("dark")) {
    theme.value = "darkCompact";
  } else {
    theme.value = "compact";
  }
};
onMounted(() => {
  checkTheme();
  document.addEventListener("dark-mode", () => {
    checkTheme();
  });
});

const sourceLookup = computed(() => {
  return keyBy(source.value, (item) => item.url);
});

const onEditRow = (e: CustomEvent) => {
  const {url} = e.detail;
  const editUrls = new Set([url]);
  if (props.selectedRows.size > 0) {
    props.selectedRows.forEach((item) => editUrls.add(item));
  }
  emits("editRow", Array.from(editUrls));
};

const onDeleteRow = (e: CustomEvent) => {
  let urls: string[];

  if (props.selectedRows.size > 0) {
    urls = Array.from(props.selectedRows);
  } else {
    const {url} = e.detail;
    urls = [url];
  }
  emits("deleteRow", urls);
};

const onReloadRow = (e: CustomEvent) => {
  const {url} = e.detail;
  emits('reloadRow', url);
}

const getExportingPlugin = async () => {
  const plugins = await grid.value?.$el.getPlugins() as ExportFilePlugin[];
  const exportPlugin: ExportFilePlugin | undefined = plugins.find(p => p.exportFile);

  return exportPlugin ?? null;
};

const exportToCSV = async () => {
  const exportPlugin = await getExportingPlugin();

  if (!exportPlugin) {
    return;
  }

  await exportPlugin.exportFile({filename: `Tempus monitor - ${localJsDateToDateString(new Date())}`});
};

const updateRow = (rows: Array<UpdateRow>) => {
  const updatedRows: SitesData[] = [];

  rows.forEach(({prop, model, newValue}) => {
    if (!model) {
      return;
    }
    const settings: SitesData['settings'] = {...DEFAULT_SETTINGS};

    if (!isCustomField(prop)) {
      // User should be able to edit only custom field columns.
      throw new Error(`${prop} is not a setting value`);
    }

    Object.keys(settings).forEach(key => {
      const settingsKey = key as keyof SiteSettings;

      if (prop === settingsKey) {
        settings[settingsKey] = newValue;
        return;
      }

      if (model[settingsKey] !== undefined) {
        settings[settingsKey] = model[settingsKey] as any;
      }
    });

    updatedRows.push({
      url: model.url,
      settings: settings
    });
  });

  if (updatedRows.length === 0) {
    return;
  }

  emits('updateRow', updatedRows);
};

const onCellEdit = (e: CustomEvent) => {
  e.preventDefault();
  const {val, prop} = e.detail;
  const toUpdate = Array.from(props.selectedRows).map((url) => {
    return {
      prop,
      model: sourceLookup.value[url],
      newValue: val
    };
  });


  updateRow(toUpdate);
};

const onAutofill = async (e: CustomEvent) => {
  const {mapping, newData} = e.detail;

  if (!Object.keys(mapping).length) {
    return;
  }

  const source = await grid.value?.$el.getVisibleSource();
  if (!source) {
    return;
  }

  const updatedCells: UpdateRow[] = [];

  Object.keys(mapping).forEach(row => {
    const mappingData = mapping[row as unknown as number];
    const newValue = newData[row as unknown as number];
    const mappedKeys = Object.keys(mappingData);
    if (mappedKeys.length === 0) {
      return;
    }

    const key = mappingData[mappedKeys[0]].colProp;

    if (newValue[key] !== undefined) {
      updatedCells.push({
        prop: key,
        model: source[Number(row)],
        newValue: newValue[key]
      });
    }
  });

  updateRow(updatedCells);
};

// Set checkbox on cell focus
const selectCurrentRow = (e: CustomEvent) => {
  const {column, model} = e.detail;
  if (column.prop === 'checkbox' || column.prop === 'edit') {
    return;
  }

  props.selectedRows.clear();
  props.selectedRows.add(model.url);
};

// Set multiple checkboxes on range selection
const onShiftSelect = async (e: CustomEvent) => {
  const {y, y1} = e.detail;

  if (y !== y1) {
    const source = await grid.value?.$el.getVisibleSource();

    if (!source) {
      return;
    }

    const selectedSource = source.slice(y, y1 + 1);
    selectedSource.forEach(({url}) => {
      props.selectedRows.add(url);
    });
  }
};

const refreshRowCounter = async (e: CustomEvent) => {
  const rows = await grid.value?.$el?.getVisibleSource();
  const visibleRowsCount = rows?.length ?? 0;
  emits('updateRowCount', visibleRowsCount);
}

const getFilterPlugin = async (): Promise<AdvanceFilterPlugin|null> => {
  const plugins = await grid.value?.$el.getPlugins() as AdvanceFilterPlugin[];
  const filterPlugin: AdvanceFilterPlugin | undefined = plugins.find(p => p.miniFilterUpdate);

  return filterPlugin ?? null;
}

// Set filters from personalization only when grid has been inited
let isFiltersInit = false;
const syncFilter = async () => {
  const filterPlugin = await getFilterPlugin();
  if (!filterPlugin) { return; }
  const filterItems = filterPlugin.multiFilterItems;
  emits('syncFilter', JSON.stringify(filterItems));
  isFiltersInit = true;
}


const unsubFilterWatcher = watch(() => props.gridFilters, async () => {
  if (isFiltersInit) {
    unsubFilterWatcher();
    return;
  }

  const filterPlugin = await getFilterPlugin();

  if (filterPlugin && props.gridFilters) {
    await nextTick()
    await filterPlugin.onFilterChange(JSON.parse(props.gridFilters));
    unsubFilterWatcher();
  }
})

// Needs to update checkboxes and group aggregation
watch(() => props.selectedRows, () => {
  grid.value?.$el.refresh();
}, {deep: true});

defineExpose({
  exportToCSV
});
</script>

<style lang="scss" scoped>
.rv-grid {
  :deep(.edit-cell) {
    > span {
      & {
        height: 100%;
        display: block;
        line-height: 34px;
      }
    }
  }

  :deep(.groupingRow) {
    & > div {
      height: 100%;

      // Chevron Icon for groups
      .chevron {
        display: inline-block;
        width: 0;
        height: 0;
        border-style: solid;
        cursor: pointer;
      }

      .chevron-down {
        border-width: 8px 5px 0 5px;
        border-color: black transparent transparent transparent;
      }

      .chevron-right {
        border-width: 5px 0 5px 8px;
        border-color: transparent transparent transparent black;
      }
    }
  }

  :deep(revogr-edit) {
    input {
      background-color: transparent;
    }
  }
}
</style>

<style lang="scss">
$input-color: #fff;
$dark-input-color: rgb(55 65 81 / var(--tw-bg-opacity));
$border-color: #ccc;
$dark-border-color: rgb(75 85 99 / var(--tw-border-opacity));

revogr-filter-panel {
  .select-css {
    background-color: $input-color;
    border-color: $border-color;
  }
}

revogr-header {
  .rgHeaderCell {
    .rv-filter {
      display: flex;
      align-items: center;
      justify-content: center;
      &.active {
        background-color: theme('colors.blue.600');
        .filter-img {
          color: #fff;
        }
      }
    }
  }
}

.dark {
  revogr-filter-panel {
    .select-css {
      background-color: $dark-input-color;
      border-color: $dark-border-color;
      color: white;
    }

    .filter-holder {
      input[type="text"] {
        background-color: $dark-input-color;
        color: white;
      }
    }
  }
}
</style>
