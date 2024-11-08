<template>
  <div v-if="visible"
       class="global-warning flex items-center p-4 mb-4 border-t-4"
       :class="borderClass"
       role="alert">
    <svg class="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor"
         viewBox="0 0 20 20">
      <path
        d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
    </svg>
    <div class="ms-3 text-sm font-medium">
      {{ text }}
    </div>
    <button type="button"
            class="ms-auto -mx-1.5 -my-1.5 rounded-lg inline-flex items-center justify-center h-8 w-8"
            :class="buttonClass"
            aria-label="Close"
            @click="hideAlert">
      <span class="sr-only">Dismiss</span>
      <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import {useAlert, AlertType} from '../composables/useAlert.ts';
import {computed} from 'vue';

const {state, hideAlert} = useAlert();
const visible = computed(() => state.value.visible);
const type = computed(() => state.value.type);
const text = computed(() => state.value.text);

const borderClass = computed(() => {
  switch (type.value) {
    case AlertType.Error:
      return 'text-red-800 border-red-300 bg-red-50 dark:text-red-400 dark:bg-gray-800 dark:border-red-800';
    case AlertType.Warning:
      return 'text-yellow-800 border-yellow-300 bg-yellow-50 dark:text-yellow-300 dark:bg-gray-800 dark:border-yellow-800';
    default:
      throw new Error(`Unknown alert type: ${type.value}`);
  }
});

const buttonClass = computed(() => {
  switch (type.value) {
    case AlertType.Error:
      return 'bg-red-50 text-red-500 focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700';
    case AlertType.Warning:
      return 'bg-yellow-50 text-yellow-500 focus:ring-2 focus:ring-yellow-400 p-1.5 hover:bg-yellow-200 dark:bg-gray-800 dark:text-yellow-300 dark:hover:bg-gray-700';
    default:
      throw new Error(`Unknown alert type: ${type.value}`);
  }
});
</script>

<style scoped lang="scss">
$header-height: 4rem;
.global-warning {
  z-index: 1000;
  position: fixed;
  top: $header-height;
  right: 0;
  width: 100%;
}
</style>
