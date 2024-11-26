<template>
  <button
    class="inline-flex items-center px-3 py-1.5 text-sm font-sm text-center text-gray-900 items-center bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-lg border border-gray-300 hover:text-gray-1000 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>
