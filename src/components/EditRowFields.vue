<template>
  <div class="space-y-4 h-full overflow-y-auto px-4">

    <div v-if="!isMultipleEdit">
      <label for="url" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">URL</label>
      <input v-model.trim.lazy="newUrl" type="text" name="title" id="url"
             class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
             placeholder="Type URL" />
    </div>

    <div>
      <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Customer</label>
      <input v-model="customer" type="text" name="title" id="name"
             class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
             placeholder="Type customer name" />
    </div>

    <div>
      <Select v-model:value="environment" :source="environmentDataSource" label="Environment" />
    </div>

    <div>
      <Select v-model:value="hasIntegrationValue" :source="booleanDataSource" label="Has integration" />
    </div>

    <div>
      <Select v-model:value="resource" :source="resourceSource" label="CSM" />
    </div>

    <br /> <br />

    <br /> <br />

    <div class="bottom-0 left-0 flex justify-center w-full pb-4 space-x-4 md:px-4 md:absolute">
      <button
        class="text-white w-full justify-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
        @click="saveRow">
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
  editUrls: Array<string> | null;
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

const newUrl = ref('');
const customer = ref<SiteSettings['customer']|null>(null);
const environment = ref<SiteSettings['environment']>(null);
const hasIntegration = ref<SiteSettings['hasIntegration']|null>(null);
const resource = ref<SiteSettings['resource']|null>(null)

const isCreationMode = computed(() => props.editUrls === null);
const resourceSource = computed<Array<SelectSource>>(() => {
  return props.resources ? getResourceDataSource(props.resources) : [];
});

const hasIntegrationValue = computed({
  get: () => String(hasIntegration.value ?? ''),
  set: (value: string) => hasIntegration.value = setBooleanValue(value)
});

const isMultipleEdit = computed(() => (props.editUrls?.length ?? 0) > 1);

const setSiteDataSettings = (siteData: SiteSettings) => {
  newUrl.value = siteData.url ?? '';
  customer.value = siteData.customer;
  environment.value = siteData.environment;
  hasIntegration.value = siteData.hasIntegration;
  resource.value = siteData.resource;
};

const getSiteSettings = (defaultValues: SiteSettings) => {
  return {
        customer: customer.value ?? defaultValues.customer,
        environment: environment.value ?? defaultValues.environment,
        hasIntegration: hasIntegration.value ?? defaultValues.hasIntegration,
        resource: resource.value ?? defaultValues.resource
      }
};

const initEdit = () => {
  // Creation
  if (props.editUrls === null) {
    setSiteDataSettings(DEFAULT_SETTINGS);
    return;
  }

  // Multiple edit
  if (isMultipleEdit.value) {
    return;
  }

  // Single edit
  const siteData = props.source.get(props.editUrls[0]);

  if (!siteData) {
    console.warn(`No site data found for ${props.editUrls[0]}`);
    emits('closePopup');
    return;
  }

  setSiteDataSettings(siteData);
};

const isValidUrl = (url: string | null) => {
  if (url === null) {
    return false;
  }

  return validateUrl(url);
};

const saveRow = () => {
  if (isCreationMode.value) {
    createRow();
  } else {
    updateRow();
  }
};

const createRow = () => {
  const url = newUrl.value;

  if (!isValidUrl(url)) {
    showAlert('Invalid URL', AlertType.Warning);
    return;
  }

  const siteData: SitesData = {
    url: url!,
    settings: getSiteSettings({
      ...DEFAULT_SETTINGS,
      environment: Environment.Dev,
    })
  };

  emits('create', [siteData]);
};

const updateRow = () => {
  if (props.editUrls === null) {
    throw new Error(`editUrl can't be null for updating row`);
  }

  if (!isMultipleEdit.value && !isValidUrl(newUrl.value)) {
      showAlert('Invalid URL', AlertType.Warning);
      return;
  }

  const siteData: SitesData[] = props.editUrls.map((url) => {
    const existingSite = props.source.get(url);

    if (!existingSite) {
      throw new Error(`${url} hasn't been found`);
    }

    const isNewUrl = url !== newUrl.value;

    return {
      url: url!,
      settings: getSiteSettings(existingSite),
      newUrl: isNewUrl ? newUrl.value : undefined
    };
  });
  emits('update', siteData);
};

onMounted(() => {
  initEdit();
});

</script>
