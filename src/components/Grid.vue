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
    :plugins="[AdvanceFilterPlugin, RangePlugin, HighlightSelection, GreyedOutOfflineSites]"
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
    @columndragstart="onColReorderStart"
    @beforecolumndragend="onColReorderMove"
    @aftergridinit="initPingatService"
    @aftergridrender="updatePingat"
    @viewportscroll="updatePingat"
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
import {computed, onMounted, ref, toRef, watch, toRaw, nextTick, onUnmounted} from "vue";
import {
  keyBy,
  localJsDateToDateString,
  type Site,
  type SitesData,
  type SiteSettings, validateUrl
} from "../services";
import {CHECKBOX_COLUMN} from "./grid.columns";
import ActionsRenderer from "./gridRenderers/ActionsRenderer.vue";
import {AdvanceFilterPlugin} from './gridPlugins/advanceFilterPlugin/AdvanceFilterPlugin.ts';
import {DEFAULT_SETTINGS} from '../services/edit.defaults.ts';
import {isCustomField} from '../services/edit.helpers.ts';
import {GRID_EDITORS} from './gridEditors/editors.ts';
import {RangePlugin} from './gridPlugins/rangePlugin.ts';
import {HighlightSelection} from './gridPlugins/highlightSelection.ts';
import {GreyedOutOfflineSites} from './gridPlugins/greyedOutOfflineSites.ts';
import {usePingatService} from '../composables/usePingatService.ts';
import {AlertType, useAlert} from '../composables/useAlert.ts';

type UpdateRow = { prop: keyof SiteSettings | 'url', model: Site, newValue: any };

const FIXED_COLUMN_PROPS = ['checkbox', 'edit'];

const grid = ref<{ $el: HTMLRevoGridElement } | null>(null);
const gridEditors = GRID_EDITORS;

const {initPingatService, stopPingatService, updatePingat} = usePingatService(grid);
const {showAlert} = useAlert();

interface Props {
  data: Array<Site>;
  columns: ColumnRegular[];
  grouping?: { props: [ColumnProp] };
  selectedRows: Set<string>;
  loadingUrls: Set<string>;
  gridFilters?: string;
}

const props = defineProps<Props>();
const emits = defineEmits<{
  (e: "editRow", url: string[]): void;
  (e: "deleteRow", url: string[]): void;
  (e: 'updateRow', sites: Array<SitesData>): void;
  (e: 'reloadRow', site: string): void;
  (e: 'syncFilter', filters: string): void;
  (e: 'updateRowCount', total: number): void;
  (e: 'colReorder', propsOrder: ColumnProp[]): void;
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

onUnmounted(() => {
  stopPingatService();
})

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
};

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

    const isUrlChanges = prop === 'url';

    if (!isUrlChanges && !isCustomField(prop)) {
      // User should be able to edit only custom field columns.
      throw new Error(`${prop} is not a setting value`);
    }

    if (isUrlChanges && !validateUrl(newValue)) {
      showAlert('Invalid URL', AlertType.Warning);
      return;
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

    const row: SitesData = {
      url: model.url,
      settings: settings
    };

    if (isUrlChanges) {
      row.newUrl = newValue;
    }

    updatedRows.push(row);
  });

  if (updatedRows.length === 0) {
    return;
  }

  emits('updateRow', updatedRows);
};

const onCellEdit = (e: CustomEvent) => {
  e.preventDefault();
  const {val, prop} = e.detail;

  let rows = Array.from(props.selectedRows);

  if (prop === 'url') {
    rows = [rows[0]];
  }

  const toUpdate = rows.map((url) => {
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
};

const onColReorderStart = (e: CustomEvent) => {
  const prop = e.detail.prop;

  if (FIXED_COLUMN_PROPS.includes(prop)) {
    e.preventDefault();
  }
};

const onColReorderMove = (e: CustomEvent) => {
  const newPosition = e.detail.newPosition.itemIndex - FIXED_COLUMN_PROPS.length;
  const startPosition = e.detail.startPosition.itemIndex - FIXED_COLUMN_PROPS.length;
  if (newPosition < 0) {
    e.preventDefault();
    return;
  }

  const columnProps = props.columns.map(({prop}) => prop);
  const orderingColumn = columnProps.splice(startPosition, 1);
  columnProps.splice(newPosition, 0, orderingColumn[0]);
  emits('colReorder', columnProps);
};


const getFilterPlugin = async (): Promise<AdvanceFilterPlugin | null> => {
  const plugins = await grid.value?.$el.getPlugins() as AdvanceFilterPlugin[];
  const filterPlugin: AdvanceFilterPlugin | undefined = plugins.find(p => p.miniFilterUpdate);

  return filterPlugin ?? null;
};

// Set filters from personalization only when grid has been inited
let isFiltersInit = false;
const syncFilter = async () => {
  const filterPlugin = await getFilterPlugin();
  if (!filterPlugin) {
    return;
  }
  emits('syncFilter', filterPlugin.getJSON());
  isFiltersInit = true;
};


const unsubFilterWatcher = watch(() => props.gridFilters, async () => {
  if (isFiltersInit) {
    unsubFilterWatcher();
    return;
  }

  const filterPlugin = await getFilterPlugin();

  if (filterPlugin && props.gridFilters) {
    await nextTick();
    await filterPlugin.onFilterChange(filterPlugin.parseJSON(props.gridFilters));
    unsubFilterWatcher();
  }
});

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


.offline-row-bg {
  background-color: theme('colors.gray.200') !important;
}

.highlight-row-bg {
  background-color: theme('colors.yellow.100') !important;
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

  .offline-row-bg {
    background-color: theme('colors.zinc.700') !important;
  }

  .highlight-row-bg {
    background-color: theme('colors.indigo.950') !important;
  }
}
</style>
