<template>
  <div class="space-y-4 h-full overflow-y-auto px-4">

    <div v-if="isCreationMode">
      <label for="url" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">URL</label>
      <input v-model.trim.lazy="newUrl" type="text" name="title" id="url"
             class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
             placeholder="Type URL" />
    </div>

    <div>
      <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Customer</label>
      <input v-model="editData.customer" type="text" name="title" id="name"
             class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
             placeholder="Type customer name" />
    </div>

    <div>
      <Select v-model:value="editData.environment" :source="environmentDataSource" label="Environment" />
    </div>

    <div>
      <Select v-model:value="hasIntegration" :source="booleanDataSource" label="Has integration" />
    </div>

    <div>
      <Select v-model:value="editData.resource" :source="resourceSource" label="CSM" />
    </div>

    <br /> <br />

    <br /> <br />

    <div class="bottom-0 left-0 flex justify-center w-full pb-4 space-x-4 md:px-4 md:absolute">
      <button
        class="text-white w-full justify-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
        @click="updateRow">
        {{ isCreationMode ? 'Add' : 'Update' }}
      </button>
      <button
        class="inline-flex w-full justify-center text-gray-500 items-center bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
        @click="emits('closePopup')">
        <svg aria-hidden="true" class="w-5 h-5 -ml-1 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"
             xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {type Site, type SitesData, type SiteSettings, validateUrl} from '../services';
import {computed, onMounted, ref} from 'vue';
import {DEFAULT_SETTINGS} from '../services/edit.defaults.ts';
import {Environment} from '../services/consts.ts';
import Select from './select/Select.vue';
import {type SelectSource, booleanDataSource, environmentDataSource, getResourceDataSource} from './select/defaults.ts';
import {createStringDataSource, setBooleanValue} from './select/helpers.ts';
import {AlertType, useAlert} from '../composables/useAlert.ts';

interface Props {
  visible: boolean;
  editUrl: string | null;
  source: Map<string, Site>;
  resources: string[] | null;
}

const {showAlert} = useAlert();

const props = defineProps<Props>();
const emits = defineEmits<{
  (e: 'closePopup'): void
  (e: 'update', row: SitesData[]): void
  (e: 'create', row: SitesData[]): void
}>();

const editData = ref<SiteSettings>({...DEFAULT_SETTINGS});

const newUrl = ref('');

const isCreationMode = computed(() => props.editUrl === null);
const resourceSource = computed<Array<SelectSource>>(() => {
  return props.resources ? getResourceDataSource(props.resources) : [];
});

const hasIntegration = computed({
  get: () => String(editData.value.hasIntegration),
  set: (value: string) => editData.value.hasIntegration = setBooleanValue(value)
});
const initEdit = () => {
  if (!props.editUrl) {
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
    hasIntegration: siteData.hasIntegration,
    resource: siteData.resource
  };
};

const isValidUrl = (url: string | null) => {
  if (url === null) {
    return false;
  }

  return validateUrl(url);
};

const updateRow = () => {
  const url = isCreationMode.value ? newUrl.value : props.editUrl;
  if (!isValidUrl(url)) {
    showAlert('Invalid URL', AlertType.Warning);
    return;
  }

  const siteData: SitesData = {
    url: url!,
    settings: editData.value
  };

  if (isCreationMode.value) {
    emits('create', [siteData]);
  } else {
    emits('update', [siteData]);
  }
};

onMounted(() => {
  initEdit();
});

</script>
