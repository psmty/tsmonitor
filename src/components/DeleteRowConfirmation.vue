<template>
  <div class="pl-4 pr-2">
    <h3 class="mb-6 text-lg text-gray-500 dark:text-gray-400">
      Are you sure you want to delete the following sites from the grid?
      <ul class="max-w-fit max-h-80 overflow-auto space-y-1 text-gray-500 list-disc list-inside dark:text-gray-400">
        <li v-for="url of urls" :key="url"><b>{{ url }}</b></li>
      </ul>
    </h3>
    <button
      class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-3 py-2.5 text-center mr-2 dark:focus:ring-red-900"
      @click="emits('delete', urls)"
    >
      Yes, I'm sure
    </button>
    <button
      class="text-gray-900 bg-white hover:bg-gray-100 focus:ring-4 focus:ring-primary-300 border border-gray-200 font-medium inline-flex items-center rounded-lg text-sm px-3 py-2.5 text-center dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700"
      @click="emits('close')"
    >
      No, cancel
    </button>
  </div>
</template>

<script setup lang="ts">

interface Props {
  urls: string[];
}

const props = defineProps<Props>();
const emits = defineEmits<{
  (e: 'delete', urls: string[]): void,
  (e: 'close'): void,
}>();
</script>
