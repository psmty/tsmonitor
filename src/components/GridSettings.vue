<template>
  <div class="settings p-5 gap-1 flex flex-col items-start">
    <button
      class="min-h-8 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-4 focus:outline-none focus:ring-primary-300 focus:z-10 block py-1.5 px-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-gray-600 dark:border-gray-500 text-start"
      @click="emits('clearFilters')"
    >
      Clear Filters
    </button>
  </div>
</template>

<script setup lang="ts">
const emits = defineEmits<{
  (e: 'clearFilters'): void
}>()
</script>
