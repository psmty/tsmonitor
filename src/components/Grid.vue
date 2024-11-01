<template>
  <VGrid
    class="grow"
    ref="grid"
    resize
    readonly
    filter
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
import {type ColumnRegular, VGrid, VGridVueTemplate} from "@revolist/vue3-datagrid";
// import ExportFilePlugin from '@revolist/revogrid/dist/types/plugins/export/export.plugin';
import {computed, onMounted, ref} from "vue";
import type {Site} from "../services";
import {GRID_COLUMNS} from "./grid.columns";
import EditRenderer from './gridRenderers/EditRenderer.vue';

const grid = ref<{ $el: HTMLRevoGridElement } | null>(null);

interface Props {
  data: Array<Site>;
}

const props = defineProps<Props>();
const emits = defineEmits<{
  (e: "editRow", url: string): void;
}>();

const editGrid: ColumnRegular = {
  name: '',
  prop: '',
  size: 50,
  sortable: false,
  cellTemplate: VGridVueTemplate(EditRenderer)
};

const columns = [editGrid, ...GRID_COLUMNS];
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
  return props.data
});

const onEditRow = (e: CustomEvent) => {
  const {url} = e.detail;
  emits('editRow', url);
};

const getExportingPlugin = async () => {
  // const plugins = await grid.value?.$el.getPlugins() as ExportFilePlugin;
  //   const exportPlugin: ExportFilePlugin | undefined = plugins.find(p => p.exportFile);

  // const plugins = await grid.value?.$el.getPlugins() as Array<unknown>;
  //   const exportPlugin = plugins.find(p => p.exportFile);
  // console.log(exportPlugin, 'exportPlugin');
  // return exportPlugin ?? null;
}

const exportToCSV = async () => {
  // const exportPlugin = getExportingPlugin();
  //
  // if (!exportPlugin) {
  //   return;
  // }
  //
  // await exportPlugin.exportFile({filename: `Tempus monitor - ${new Date()}`});
}

defineExpose({
  exportToCSV
})
</script>
