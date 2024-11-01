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
    hide-attribution
    :theme="theme"
    @on-edit-row="onEditRow"
  />
</template>
<script lang="ts" setup>
import {type ColumnRegular, VGrid, VGridVueTemplate} from "@revolist/vue3-datagrid";
import {computed, onMounted, ref} from "vue";
import type {ParsedData} from "../services";
import {GRID_COLUMNS} from "./grid.columns";
import EditRenderer from './gridRenderers/EditRenderer.vue';
import EditIcon from './icons/EditIcon.vue';

const grid = ref<{ $el: HTMLRevoGridElement } | null>(null);

interface Props {
  data: Array<ParsedData>;
}

const props = defineProps<Props>();
const emits = defineEmits<{
  (e: "editRow", index: number): void;
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
const source = computed(() => props.data.values());

const onEditRow = (e: CustomEvent) => {
  const {rowIndex} = e.detail;
  emits('editRow', rowIndex);
};
</script>
