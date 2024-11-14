<template>
  <div class="p-2 flex flex-col grow overflow-hidden">
    <input
      type="text"
      v-model="searchQuery"
      placeholder="Search..."
      class="mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
    />

    <div class="flex items-center m-2">
      <input
        type="checkbox"
        :checked="areAllSelected"
        @change="toggleSelectAll"
        id="select-all"
        class="mr-2 hidden"
      />
      <label for="select-all" class="font-medium cursor-pointer text-black hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-400">Select All</label>
    </div>

    <ul class="grow overflow-y-auto">
      <li v-for="item in filteredList" :key="item.id" class="flex items-center mb-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-black dark:text-gray-300" @click="toggleItemSelection(item.id)">
        <input
          type="checkbox"
          :checked="selectedItems.has(item.id)"
          class="m-2 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
        />
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps } from 'vue';

interface Item {
  id: string;
  name: string;
}

const props = defineProps<{
  source: Item[];
}>();

const selectedItems = defineModel<Set<string|number>>({required: true});


const searchQuery = ref<string>('');

const filteredList = computed<Item[]>(() => {
  return props.source.filter(item =>
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});


// Computed property to check if all items are selected
const areAllSelected = computed(() =>
  filteredList.value.length > 0 && filteredList.value.every(item => selectedItems.value.has(item.id))
);

// Toggle selection of all items
const toggleSelectAll = () => {
  const newSelectedItem = new Set(selectedItems.value);
  if (areAllSelected.value) {
    filteredList.value.forEach(item => newSelectedItem.delete(item.id));
  } else {
    filteredList.value.forEach(item => newSelectedItem.add(item.id));
  }

  selectedItems.value = newSelectedItem;
};

// Toggle individual item selection
const toggleItemSelection = (id: string) => {
  const newSelectedItem = new Set(selectedItems.value);

  if (selectedItems.value.has(id)) {
    newSelectedItem.delete(id);
  } else {
    newSelectedItem.add(id);
  }
  selectedItems.value = newSelectedItem;
};
</script>

<style scoped>
/* Tailwind CSS classes used directly in template */
</style>
