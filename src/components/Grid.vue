<template>
  <VGrid
    class="grow rv-grid"
    ref="grid"
    resize
    readonly
    :filter="filters"
    :pinned-top-source="topFilterRow"
    can-move-columns
    :columns="columns"
    :source="source"
    :exporting="true"
    hide-attribution
    :theme="theme"
    @on-edit-row="onEditRow"
  />
</template>
<script lang="ts" setup>
import {
  type ColumnFilterConfig,
  type ColumnRegular,
  dispatch,
  FILTER_CONFIG_CHANGED_EVENT,
  VGrid,
  VGridVueTemplate,
} from "@revolist/vue3-datagrid";
// import ExportFilePlugin from '@revolist/revogrid/dist/types/plugins/export/export.plugin';
import { computed, onMounted, ref } from "vue";
import type { Site } from "../services";
import { GRID_COLUMNS } from "./grid.columns";
import EditRenderer from "./gridRenderers/EditRenderer.vue";

const grid = ref<{ $el: HTMLRevoGridElement } | null>(null);

interface Props {
  data: Array<Site>;
}

const props = defineProps<Props>();
const emits = defineEmits<{
  (e: "editRow", url: string): void;
}>();

const topFilterRow = ref([{}]);
const filters: ColumnFilterConfig = {
  multiFilterItems: {
    customer: [{ id: 0, type: "contains", value: "", relation: "or" }],
    url: [{ id: 1, type: "contains", value: "", relation: "or" }],
  },
};

const editGrid: ColumnRegular = {
  name: "",
  prop: "edit",
  size: 50,
  sortable: false,
  pin: "colPinStart",
  cellProperties: () => ({ class: { "edit-cell": true } }),
  cellTemplate: VGridVueTemplate(EditRenderer),
};

const filterCell: Partial<ColumnRegular> = {
  cellProperties: ({ type }) =>
    type === "rowPinStart"
      ? {
          onMouseDown: (e: MouseEvent) => {
            e.stopPropagation();
          },
          class: { "filter-cell": true },
        }
      : undefined,

  cellTemplate: (h, { value, type }) => {
    if (type === "rowPinStart") {
      return h(
        "input",
        {
          type: "text",
          onInput: (e: Event) => {
            if (!grid.value?.$el || !(e.target instanceof HTMLInputElement)) {
              return;
            }
            if (!filters.multiFilterItems) {
              filters.multiFilterItems = {
                customer: [
                  { id: 0, type: "contains", value: "", relation: "or" },
                ],
              };
            }
            filters.multiFilterItems.customer[0].value = e.target.value;
            dispatch(grid.value?.$el, FILTER_CONFIG_CHANGED_EVENT, filters);
          },
        },
        "",
      );
    }
    return value;
  },
};

const columns: ColumnRegular[] = [
  editGrid,
  {
    name: "Customer",
    prop: "customer",
    size: 300,
    sortable: true,
    ...filterCell,
  },
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

const getExportingPlugin = async () => {
  // const plugins = await grid.value?.$el.getPlugins() as ExportFilePlugin;
  //   const exportPlugin: ExportFilePlugin | undefined = plugins.find(p => p.exportFile);
  // const plugins = await grid.value?.$el.getPlugins() as Array<unknown>;
  //   const exportPlugin = plugins.find(p => p.exportFile);
  // console.log(exportPlugin, 'exportPlugin');
  // return exportPlugin ?? null;
};

const exportToCSV = async () => {
  // const exportPlugin = getExportingPlugin();
  //
  // if (!exportPlugin) {
  //   return;
  // }
  //
  // await exportPlugin.exportFile({filename: `Tempus monitor - ${new Date()}`});
};

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
  :deep(.filter-cell) {
    padding: 0;
    overflow: hidden;
    input {
      background-color: transparent;
      width: 100%;
      height: 100%;
      border: none;
      padding: 0 8px;
      box-sizing: border-box;
    }
  }
}
</style>
