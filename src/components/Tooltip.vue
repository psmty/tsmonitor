<template>
    <div class="relative flex items-center group">
      <!-- Icon Circle with Question Mark -->
      <div
        class="w-6 h-6 flex items-center justify-center bg-gray-500 text-white font-semibold rounded-full cursor-pointer"
        @mouseenter="showTooltip = true"
        @mouseleave="showTooltip = false"
      >
        ?
      </div>
  
      <!-- Tooltip Content -->
      <div
        v-if="showTooltip"
       class="absolute top-full left-full ml-2 mt-2 w-max max-w-xs p-2 text-sm text-white bg-gray-800 rounded-md shadow-lg z-10 transform -translate-x-full"
        v-html="content"
      >
      </div>
    </div>
  </template>
  

<script lang="ts" setup>
import { ref, defineProps } from "vue";

// Define the prop for tooltip content
defineProps<{
    content: string;
}>();

// State to control tooltip visibility
const showTooltip = ref(false);
</script>
