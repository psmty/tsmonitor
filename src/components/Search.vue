<template>
  <div class="search-container relative">
    <input type="text"
               class="h-8 w-60 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block p-2.5 pr-6 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
               v-model="search"
               placeholder="Search...">
    <button v-show="!!search" @click="search = ''" class="absolute right-0 top-1/2 transform -translate-y-1/2 pr-1.5"><CloseIcon class="w-3 h-3" /></button>
  </div>
</template>


<script setup lang="ts">
import CloseIcon from './icons/CloseIcon.vue';

const search = defineModel<string>();
</script>
