<template>
  <button class="align-middle opacity-90" ref="cell">
    <EditIcon @click="onClick" />
  </button>
</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue';
import EditIcon from '../icons/EditIcon.vue';
import type { ColumnDataSchemaModel } from '@revolist/vue3-datagrid';

const props = defineProps<ColumnDataSchemaModel>();
const cell = ref<HTMLElement>();

const onClick = () => {
  const url = props.model.url;
  const event = new CustomEvent('on-edit-row', {
    bubbles: true,
    detail: { url }
  });
  cell.value?.dispatchEvent(event);
};
</script>

<style scoped>
svg {
  cursor: pointer;
}
</style>
