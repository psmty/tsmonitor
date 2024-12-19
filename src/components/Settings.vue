<template>
  <button
    class="w-10 h-10 flex justify-center items-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5"
    data-tooltip-target="settings-tootlip"
    @click="isOpened = !isOpened">
    <GearIcon class="w-4 h-4" />
  </button>
  <teleport to="body">
    <SideBar v-model="isOpened">
      <template #title>Settings</template>

      <div class="settings p-5 gap-1 flex flex-col items-start">
        <button
          class="min-h-8 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-4 focus:outline-none focus:ring-primary-300 focus:z-10 block py-1.5 px-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-gray-600 dark:border-gray-500 text-start"
          @click="clearPersonalizationStore"
        >
          Clear Personalization
        </button>
      </div>
    </SideBar>
  </teleport>
  <div
    id="settings-tootlip"
    role="tooltip"
    class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip"
  >
    Settings
    <div class="tooltip-arrow" data-popper-arrow></div>
  </div>
</template>

<script setup lang="ts">
import SideBar from './SideBar.vue';
import {ref} from 'vue';
import GearIcon from './icons/GearIcon.vue';
import {useSettings} from '../composables/useSettings.ts';

const {clearPersonalizationStore} = useSettings();

const isOpened = ref(false);
</script>

<style scoped>

</style>
