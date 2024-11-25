<template>
  <div
    class="bg-gray-100 text-gray-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300 flex items-center">
    {{ selected }} / {{ max }}
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  selected: number,
  max: number
}>();
</script>
