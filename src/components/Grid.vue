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
  VGridVueTemplate
} from "@revolist/vue3-datagrid";
// import ExportFilePlugin from '@revolist/revogrid/dist/types/plugins/export/export.plugin';
import {computed, onMounted, ref} from "vue";
import {localJsDateToDateString, type Site} from "../services";
import {GRID_COLUMNS} from "./grid.columns";
import ActionsRenderer from "./gridRenderers/ActionsRenderer.vue";

const grid = ref<{ $el: HTMLRevoGridElement } | null>(null);

const selectedRows = ref(new Set<string>());

interface Props {
  data: Array<Site>;
}

const props = defineProps<Props>();
const emits = defineEmits<{
  (e: "editRow", url: string): void;
  (e: "deleteRow", url: string[]): void;
}>();

const filters: ColumnFilterConfig = {
  multiFilterItems: {
    customer: [{id: 0, type: "contains", value: "", relation: "or"}],
    url: [{id: 1, type: "contains", value: "", relation: "or"}]
  }
};

const checkboxCell = computed<ColumnRegular>(() => ({
  name: "",
  prop: "checkbox",
  size: 50,
  sortable: false,
  filter: false,
  pin: "colPinStart",
  columnTemplate: (h, p) => {
    const selected = selectedRows.value.size === source.value.length;
    return h('input', {
      type: "checkbox",
      checked: selected,
      onChange: (e: Event & { target: HTMLInputElement }) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.target.checked) {
          source.value.map(i => selectedRows.value.add(i.url));
        } else {
          selectedRows.value.clear();
        }
      }
    });
  },
  cellTemplate: (h, p) => {
    const url = p.model.url;
    const selected = selectedRows.value.has(url);
    return h('input', {
      type: "checkbox",
      checked: selected,
      onChange: (e: Event & { target: HTMLInputElement }) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.target.checked) {
          selectedRows.value.add(url);
        } else {
          selectedRows.value.delete(url);
        }
      }
    });
  }
}));

const actionsCell = computed<ColumnRegular>(() => ({
  name: "",
  prop: "edit",
  size: 70,
  sortable: false,
  filter: false,
  pin: "colPinStart",
  cellProperties: () => ({class: {"edit-cell": true}}),
  cellTemplate: VGridVueTemplate(ActionsRenderer, {
    selectedFewRows: selectedRows.value.size > 1
  })
}));

const columns = computed<ColumnRegular[]>(() => [
  checkboxCell.value,
  actionsCell.value,
  ...GRID_COLUMNS
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

  if (selectedRows.value.size > 0) {
    urls = Array.from(selectedRows.value);
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
}
</style>
