<template>
  <div class="space-y-4">

    <div>
      <label
        for="name"
        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >Customer</label
      >
      <input
        v-model="editData.customer"
        type="text"
        name="title"
        id="name"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
        placeholder="Type customer name"
      />
    </div>

    <div>
      <label
        for="environment"
        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >Environment</label
      >
      <select id="environment"
              v-model="editData.environment"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
        <option v-for="item in environmentDataSource" :key="item" :value="item">{{ item }}</option>
      </select>
    </div>

    <div>
      <label
        for="csm"
        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >CSM</label
      >
      <input
        v-model="editData.csm"
        type="text"
        name="title"
        id="csm"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
        placeholder="Type CSM"
      />
    </div>

    <div>
      <label
        for="has-integration"
        class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >Has integration</label
      >
      <select id="has-integration"
              v-model="editData.hasIntegration"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
        <option v-for="item in booleanDataSource" :key="item.text" :value="item.value">{{ item.text }}</option>
      </select>
    </div>

    <div
      class="bottom-0 left-0 flex justify-center w-full pb-4 space-x-4 md:px-4 md:absolute"
    >
      <button
        class="text-white w-full justify-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
        @click="updateRow"
      >
        Update
      </button>
      <button
        class="inline-flex w-full justify-center text-gray-500 items-center bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
        @click="emits('closePopup')"
      >
        <svg
          aria-hidden="true"
          class="w-5 h-5 -ml-1 sm:mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"></path>
        </svg
        >
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {Environment, type Site, type SitesData, type SiteSettings} from '../services';
import {ref, watch} from 'vue';
import {DEFAULT_SETTINGS} from '../services/edit.defaults.ts';

// TODO: Probably add URL field

interface Props {
  visible: boolean;
  editUrl: string | null;
  source: Map<string, Site>;
}


const props = defineProps<Props>();
const emits = defineEmits<{
  (e: 'closePopup'): void
  (e: 'update', row: SitesData): void
}>();

const editData = ref<SiteSettings>(DEFAULT_SETTINGS);

const environmentDataSource = [Environment.Dev, Environment.Prod, Environment.Trial];
const booleanDataSource = [{text: 'Yes', value: true}, {text: 'No', value: false}];

const initEdit = () => {
  if (!props.editUrl) {
    emits('closePopup');
    return;
  }
  const siteData = props.source.get(props.editUrl);

  if (!siteData) {
    console.warn(`No site data found for ${props.editUrl}`);
    emits('closePopup');
    return;
  }

  editData.value = {
    customer: siteData.customer,
    environment: siteData.environment ?? Environment.Dev,
    csm: siteData.csm,
    hasIntegration: siteData.hasIntegration
  };
};

const updateRow = () => {
  if (!props.editUrl) {
    console.warn(`No site data found for ${props.editUrl}`);
    emits('closePopup');
    return;
  }

  const siteData: SitesData = {
    url: props.editUrl,
    settings: editData.value
  }
  emits('update', siteData);
};

watch(() => props.visible, () => {
  if (props.visible) {
    initEdit();
  } else {
    editData.value = DEFAULT_SETTINGS;
  }
});
</script>

