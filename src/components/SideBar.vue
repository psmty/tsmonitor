<template>
  <div
    class="fixed top-0 right-0 z-40 w-full h-screen max-w-xs p-4 overflow-y-auto transition-transform translate-x-full bg-white dark:bg-gray-800"
    tabindex="-1"
    aria-labelledby="drawer-label"
    aria-hidden="true"
    ref="drawerRef"
  >
    <h5
      id="drawer-label"
      class="inline-flex items-center mb-6 text-sm font-semibold text-gray-500 uppercase dark:text-gray-400"
    >
      <slot name="title"></slot>
    </h5>
    <button
      type="button"
      class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 absolute top-2.5 right-2.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
      ref="close-button"
    >
      <svg
        aria-hidden="true"
        class="w-5 h-5"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clip-rule="evenodd"></path>
      </svg
      >
      <span class="sr-only">Close menu</span>
    </button>

    <slot name="default"></slot>
  </div>
</template>

<script setup lang="ts">
import {onMounted, useTemplateRef, watch} from 'vue';
import {Drawer} from 'flowbite';
import type {DrawerOptions} from 'flowbite';

const emits = defineEmits<{
  (e: 'onHide'): void
  (e: 'onShow'): void
}>();

const visible = defineModel<boolean>();


const drawerRef = useTemplateRef<HTMLDivElement>('drawerRef');
const closeButtonRef = useTemplateRef<HTMLButtonElement>('close-button');
let drawer: Drawer | null = null;

const options: DrawerOptions = {
  placement: 'right',
  backdrop: true,
  bodyScrolling: false,
  edge: false,
  edgeOffset: '',
  backdropClasses:
    'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-30',
  onHide: () => {
    if (visible.value) {
      closeDrawer();
    }
    emits('onHide');
  },
  onShow: () => {
    emits('onShow');
  }
};

const closeDrawer = () => {
  visible.value = false;
};


onMounted(() => {
  if (drawerRef.value) {
    drawer = new Drawer(drawerRef.value, options);
  }

  closeButtonRef.value?.addEventListener('click', closeDrawer);
});

watch(visible, () => {
  if (visible.value) {
    drawer?.show();
  } else {
    drawer?.hide();
  }
});
</script>
