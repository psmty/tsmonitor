<template>
  <div v-if="props.type !== 'rowPinStart'" ref="cell" class="h-full flex align-items-center gap-1">
    <button class="opacity-90" @click="onEditRow">
      <EditIcon />
    </button>

    <button>
      <DeleteIcon class="text-red-600 dark:!text-red-500" @click="onDeleteRow"/>
    </button>
  </div>
</template>

<script setup lang="ts">
import {computed, defineProps, ref} from 'vue';
import EditIcon from '../icons/EditIcon.vue';
import type {ColumnDataSchemaModel} from '@revolist/vue3-datagrid';
import DeleteIcon from '../icons/DeleteIcon.vue';

const props = defineProps<ColumnDataSchemaModel>();
const cell = ref<HTMLElement>();

const url = computed(() => props.model.url);

const onEditRow = () => {
  const event = new CustomEvent('on-edit-row', {
    bubbles: true,
    detail: {url: url.value}
  });
  cell.value?.dispatchEvent(event);
};

const onDeleteRow = () => {
  const event = new CustomEvent('on-delete-row', {
    bubbles: true,
    detail: {url: url.value}
  });
  cell.value?.dispatchEvent(event);
}
</script>

<style scoped>
svg {
  cursor: pointer;
}
</style>
