<template>
  <div ref="cell">
    <EditIcon @click="onClick"/>
  </div>
</template>

<script setup lang="ts">
import {defineProps, ref} from 'vue';
import EditIcon from '../icons/EditIcon.vue';
import type {ColumnDataSchemaModel} from '@revolist/vue3-datagrid';

const props = defineProps<ColumnDataSchemaModel>();
const cell = ref<HTMLElement>();

const onClick = () => {
  const rowIndex = props.rowIndex;
  const event = new CustomEvent('on-edit-row', {
    bubbles: true,
    detail: {rowIndex}
  });
  cell.value?.dispatchEvent(event);
};
</script>

<style scoped>
svg {
  cursor: pointer;
}
</style>
