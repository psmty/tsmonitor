<template>
  <button
    class="inline-flex px-3 py-1.5 text-sm font-sm text-center  items-center  focus:ring-4 focus:outline-none  rounded-lg   focus:z-10 "
    :class="scheme"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import {computed, type PropType} from 'vue';

const props = defineProps({
  color: {
    type: String as PropType<'dark'|'green'>,
    default: 'dark'
  }
});

const scheme = computed(() => {
  switch (props.color) {
    case 'dark':
      return 'text-gray-900 hover:bg-gray-100 bg-white  focus:ring-primary-300 border-gray-300 hover:text-gray-1000 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600 border';
      case 'green':
        return 'text-white bg-green-600 hover:bg-green-700 focus:ring-green-300 dark:focus:ring-green-900'
    default:
      throw new Error(`Unknown color scheme: ${props.color}`);
  }
});
</script>
