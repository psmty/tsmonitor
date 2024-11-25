<template>
  <SelectEditor v-bind="props" :save="booleanSave" />
</template>

<script setup lang="ts">
import type {EditorType} from '@revolist/vue3-datagrid';
import type {SelectSource} from '../select/defaults.ts';
import SelectEditor from './SelectEditor.vue';

type SelectEditorProps = {
  column: EditorType['column'] & {getOptions(...args: any): Array<SelectSource>}
} & EditorType

const props = defineProps<SelectEditorProps>();

const booleanSave = (value: string): void => {
  props.save(value === 'true');
}
</script>
