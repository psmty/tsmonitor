<template>
  <div>
    <label v-if="label" :for="label" class="block mb-2 text-sm font-sm text-gray-900 dark:text-white">{{
        label
      }}</label>
    <Dropdown v-model="opened" button-class="text-start">
      <template #title>
        {{ selectedTitle }}
      </template>

      <div class="select flex flex-col gap-1 max-h-80 overflow-y-auto">
        <input type="text"
               class="mb-2 h-8 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
               v-model="search"
               placeholder="Search...">
        <div v-for="item in filteredSource" :key="item.id ?? ''" :value="item.id"
             class="px-4 py-1 rounded-md cursor-pointer text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white text-sm"
             :class="{'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white': selectedValue?.id === item.id}"
             @click="onChange(item.id)">{{ item.value }}
        </div>
      </div>
    </Dropdown>
  </div>
</template>

<script setup lang="ts">
import {EMPTY_ID, type SelectItemId, type SelectSource} from './defaults.ts';
import {computed, type PropType, ref, watch} from 'vue';
import Dropdown from './Dropdown.vue';

const opened = defineModel('opened', {default: false})

const props = defineProps({
  name: {
    type: String,
    default: ''
  },
  prefix: {
    type: String,
    default: ''
  },
  source: {
    type: Array as () => SelectSource[],
    required: true
  },
  label: {
    type: String
  },
  value: {
    type: String as PropType<SelectItemId>
  }
});
const emit = defineEmits<{
  (e: 'update:value', value: string | null): void
}>();

const search = ref('');

const selectedTitle = computed(() => {
  const selected = selectedValue.value;
  if (!selected) {
    return '';
  }

  if (selected.id === EMPTY_ID) {
    return selected.value;
  }

  return props.prefix ? `${props.prefix} ${selected.value}` : selected.value;
})

const filteredSource = computed(() => {
  return props.source.filter((item: SelectSource) => item.value.toLowerCase().includes(search.value.toLowerCase()));
});

const sourceLookup = computed(() => {
  return props.source?.reduce((acc, item) => {
    acc[String(item.id)] = item;
    return acc;
  }, {} as Record<string, SelectSource>);
});

const selectedValue = computed<SelectSource|null>(() => {
  if (!props.value) {
    return null;
  }

  return sourceLookup.value[props.value];
});

const onChange = (value: SelectItemId) => {
  opened.value = false;
  emit('update:value', value);
};

watch(opened, () => {
  if (opened.value) {
    search.value = '';
  }
});
</script>
