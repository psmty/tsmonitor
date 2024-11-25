<template>
  <Select :opened="true" v-model:value="value" :source="dataSource" @update:opened="close" />
</template>

<script setup lang="ts">
import type {EditorType} from "@revolist/vue3-datagrid";
import {type SelectSource} from '../select/defaults.ts';
import Select from '../select/Select.vue';
import {computed} from 'vue';

type SelectEditorProps = {
  column: EditorType['column'] & {getOptions(...args: any): Array<SelectSource>}
} & EditorType

const props = defineProps<SelectEditorProps>();
const dataSource: Array<SelectSource> = props.column.column.getOptions();;

const value = computed({
  get: () => props.model?.[props.prop ?? ''] ?? false,
  set: (value: boolean): void => {
    props.save(value);
  }
});

const close = () => {
  props.close();
};
</script>

