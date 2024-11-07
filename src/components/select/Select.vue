<template>
    <div>
      <label v-if="label" :for="label" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{{  label  }}</label>
      <select :id="label" :value="value" @change="onChange"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
        <option v-for="item in source" :key="item.id" :value="item.id">{{ item.value }}</option>
      </select>
    </div>
</template>

<script setup lang="ts">
import type {SelectSource} from './defaults.ts';

defineProps({
  source: {
    type: Array as () => SelectSource[],
    required: true
  },
  label: {
    type: String,
  },
  value: {
    type: String,
  }
})
const emit = defineEmits<{
  (e: 'update:value', value: string): void
}>()
const onChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:value', target.value)
}
</script>
