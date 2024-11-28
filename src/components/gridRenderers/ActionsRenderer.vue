<template>
  <div v-if="props.type !== 'rowPinStart'" ref="cell" class="h-full flex align-items-center gap-3">
    <LoadingIcon v-if="isLoading"/>
    <button v-else class="opacity-90" @click="onForceReload">
      <ReloadIcon />
    </button>

    <button class="opacity-90" @click="onEditRow">
      <EditIcon />
    </button>

    <button>
      <DeleteIcon class="opacity-90" @click="onDeleteRow"/>
    </button>
  </div>
</template>

<script setup lang="ts">
import {computed, defineProps, ref} from 'vue';
import EditIcon from '../icons/EditIcon.vue';
import type {ColumnDataSchemaModel} from '@revolist/vue3-datagrid';
import DeleteIcon from '../icons/DeleteIcon.vue';
import ReloadIcon from '../icons/ReloadIcon.vue';
import LoadingIcon from '../icons/LoadingIcon.vue';

interface ActionRendererProps extends ColumnDataSchemaModel {
  loadingUrls: Set<string>;
}

const props = defineProps<ActionRendererProps>();
const cell = ref<HTMLElement>();

const url = computed(() => props.model.url);
const isLoading = computed(() => props.loadingUrls.has(url.value));

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

const onForceReload = () => {
const event = new CustomEvent('on-reload-row', {
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
