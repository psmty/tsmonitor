<template>
  <VGrid
    class="grow rv-grid"
    ref="grid"
    resize
    readonly
    :filter="filters"
    can-move-columns
    :columns="columns"
    :source="source"
    :exporting="true"
    hide-attribution
    :theme="theme"
    @on-edit-row="onEditRow"
    @on-delete-row="onDeleteRow"
  />
</template>
<script lang="ts" setup>
import {
  type ColumnFilterConfig,
  type ColumnRegular,
  type ExportFilePlugin,
  dispatch,
  FILTER_CONFIG_CHANGED_EVENT,
  VGrid,
  VGridVueTemplate,
} from "@revolist/vue3-datagrid";
// import ExportFilePlugin from '@revolist/revogrid/dist/types/plugins/export/export.plugin';
import { computed, onMounted, ref } from "vue";
import { localJsDateToDateString, type Site } from "../services";
import { GRID_COLUMNS } from "./grid.columns";
import ActionsRenderer from "./gridRenderers/ActionsRenderer.vue";

const grid = ref<{ $el: HTMLRevoGridElement } | null>(null);

interface Props {
  data: Array<Site>;
}

const props = defineProps<Props>();
const emits = defineEmits<{
  (e: "editRow", url: string): void;
  (e: "deleteRow", url: string): void;
}>();

const filters: ColumnFilterConfig = {
  multiFilterItems: {
    customer: [{ id: 0, type: "contains", value: "", relation: "or" }],
    url: [{ id: 1, type: "contains", value: "", relation: "or" }],
  },
};

const actionsCell: ColumnRegular = {
  name: "",
  prop: "edit",
  size: 70,
  sortable: false,
  pin: "colPinStart",
  cellProperties: () => ({ class: { "edit-cell": true } }),
  cellTemplate: VGridVueTemplate(ActionsRenderer),
};

const columns: ColumnRegular[] = [
  actionsCell,
  ...GRID_COLUMNS,
];
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
  const { url } = e.detail;
  emits("editRow", url);
};

const onDeleteRow = (e: CustomEvent) => {
  const { url } = e.detail;
  emits("deleteRow", url);
}

const getExportingPlugin = async () => {
  const plugins = await grid.value?.$el.getPlugins() as ExportFilePlugin[];
  const exportPlugin: ExportFilePlugin | undefined = plugins.find(p => p.exportFile);

  return exportPlugin ?? null;
}

const exportToCSV = async () => {
  const exportPlugin = await getExportingPlugin();

  if (!exportPlugin) {
    return;
  }

  await exportPlugin.exportFile({filename: `Tempus monitor - ${localJsDateToDateString(new Date())}`});
}

defineExpose({
  exportToCSV,
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
}
</style>
