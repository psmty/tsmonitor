<template>
  <button
    @click="onButtonClick"
    ref="triggerButton"
    class="min-h-8 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  focus:ring-4 focus:outline-none focus:ring-primary-300 focus:z-10  block w-full py-1.5 px-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-gray-600 dark:border-gray-500"
    :class="buttonClass"
  >
    <slot name="title">Dropdown</slot>
  </button>

  <teleport to="body">
    <div
      v-if="visible"
      :style="modalPosition"
      ref="modal"
      class="absolute z-50 bg-white border border-gray-300 rounded-md shadow-lg w-64 p-4 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
      @mouseup.stop
    >
      <slot />
    </div>
  </teleport>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted, watch, onUnmounted, nextTick} from 'vue';
import {debounce} from '../../services';

const props = defineProps<{
  buttonClass?: string;
}>()

const visible = defineModel<boolean>();

const modalPosition = reactive<{ top: string; left: string }>({ top: '0px', left: '0px' });
const triggerButton = ref<HTMLElement | null>(null);
const modal = ref<HTMLElement | null>(null);

const unsubOutsideClick: Array<Function> = [];

const calculatePosition = () => {
  if (!triggerButton.value) return;
  const rect = triggerButton.value.getBoundingClientRect();
  modalPosition.top = `${rect.bottom + window.scrollY}px`;
  modalPosition.left = `${rect.left + window.scrollX}px`;
};

const debouncedCalculatePosition = debounce(calculatePosition, 100);

const onButtonClick = () => {
  if (visible.value) {
    visible.value = false;
    return;
  }
  visible.value = true;
  calculatePosition();
};

// Close modal when clicking outside
const handleOutsideClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (visible && modal.value && triggerButton.value) {
    if (!modal.value.contains(target) && !triggerButton.value.contains(target)) {
      visible.value = false;
    }
  }
};

// Recalculate position if visibility changes
watch(visible, (newVisible) => {
  if (newVisible) {
    calculatePosition();
    document.addEventListener('mousedown', handleOutsideClick);
    unsubOutsideClick.push(() => document.removeEventListener('mousedown', handleOutsideClick));
  } else {
    unsubOutsideClick.forEach((fn) => fn());
  }
});

// Ensure the modal recalculates position if needed
onMounted(async () => {
  window.addEventListener('resize', debouncedCalculatePosition);
  window.addEventListener('scroll', debouncedCalculatePosition);
  if (visible.value) {
    await nextTick();
    calculatePosition();
  }
});

onUnmounted(() => {
  unsubOutsideClick.forEach((fn) => fn());
  window.removeEventListener('resize', debouncedCalculatePosition);
  window.removeEventListener('scroll', debouncedCalculatePosition);
});
</script>

