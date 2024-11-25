<template>
  <VGrid
    class="grow rv-grid"
    ref="grid"
    resize
    :filter="filters"
    can-move-columns
    :columns="columns"
    :source="source"
    :exporting="true"
    :grouping="grouping"
    hide-attribution
    :theme="theme"
    :plugins="[AdvanceFilterPlugin]"
    @on-edit-row="onEditRow"
    @on-delete-row="onDeleteRow"
    @beforeedit="onCellEdit"
  />
</template>
<script lang="ts" setup>
import {
  type ColumnFilterConfig,
  type ColumnProp,
  type ColumnRegular,
  type ExportFilePlugin,
  VGrid,
  VGridVueTemplate
} from "@revolist/vue3-datagrid";
// import ExportFilePlugin from '@revolist/revogrid/dist/types/plugins/export/export.plugin';
import {computed, onMounted, ref, toRef} from "vue";
import {localJsDateToDateString, type Site, type SitesData, type SiteSettings} from "../services";
import {CHECKBOX_COLUMN, GRID_COLUMNS} from "./grid.columns";
import ActionsRenderer from "./gridRenderers/ActionsRenderer.vue";
import {AdvanceFilterPlugin} from './gridPlugins/advanceFilterPlugin/AdvanceFilterPlugin.ts';
import {DEFAULT_SETTINGS} from '../services/edit.defaults.ts';
import {isCustomField} from '../services/edit.helpers.ts';

const grid = ref<{ $el: HTMLRevoGridElement } | null>(null);


interface Props {
  data: Array<Site>;
  columns: ColumnRegular[];
  grouping?: { props: [ColumnProp] };
  selectedRows: Set<string>;
}

const props = defineProps<Props>();
const emits = defineEmits<{
  (e: "editRow", url: string): void;
  (e: "deleteRow", url: string[]): void;
  (e: 'updateRow', sites: Array<SitesData>): void;
}>();

const filters: ColumnFilterConfig = {
  multiFilterItems: {
    customer: [{id: 0, type: "contains", value: "", relation: "or"}],
    url: [{id: 1, type: "contains", value: "", relation: "or"}],
  }
};

const checkboxCell = computed<ColumnRegular>(() => (CHECKBOX_COLUMN(toRef(props.selectedRows), source)));

const actionsCell = computed<ColumnRegular>(() => ({
  name: "",
  prop: "edit",
  size: 70,
  sortable: false,
  filter: false,
  // pin: "colPinStart",  // doesn't look good with grouping
  cellProperties: () => ({class: {"edit-cell": true}}),
  cellTemplate: VGridVueTemplate(ActionsRenderer, {
  selectedFewRows: props.selectedRows.size > 1
  })
}));

const columns = computed<ColumnRegular[]>(() => [
  checkboxCell.value,
  actionsCell.value,
  ...props.columns,
]);
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
const source = computed(() => {
  return props.data;
});

const onEditRow = (e: CustomEvent) => {
  const {url} = e.detail;
  emits("editRow", url);
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

const onCellEdit = (e: CustomEvent) => {
  e.preventDefault();
  const {val, prop, model} = e.detail;

  const settings: SitesData['settings'] = {...DEFAULT_SETTINGS};

  if (!isCustomField(prop)) {
    // User should be able to edit only custom field columns.
    throw new Error(`${prop} is not a setting value`);
  }

  Object.keys(settings).forEach(key => {
    const settingsKey = key as keyof SiteSettings;

    if (key === prop) {
      settings[settingsKey] = val;
      return;
    }

    if (model[settingsKey] !== undefined) {
      settings[settingsKey] = model[settingsKey] as any;
    }
  })

  const siteData: SitesData = {
    url: model.url,
    settings: settings
  }

  emits('updateRow', [siteData])
}

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
