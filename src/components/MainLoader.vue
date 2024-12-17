<template>
<div v-show="state.visible" class="fixed inset-0 flex items-center justify-center z-[9999] bg-gray-200 dark:bg-gray-800">
  <div class="main-loader"></div>
</div>
</template>

<script setup lang="ts">

import {useLoader} from '../composables/useLoader.ts';

const {state, showLoader} = useLoader();
</script>

<style scoped lang="scss">

.main-loader {
  width: 65px;
  height: 30px;
  position: relative;
}
.main-loader:before {
  content: "";
  position: absolute;
  border-radius: 50px;
  box-shadow: 0 0 0 3px inset theme('colors.gray.800');
  animation: l3 0.75s infinite alternate;
}

.dark {
  .main-loader:before {
    box-shadow: 0 0 0 3px inset theme('colors.gray.200');
  }
}

@keyframes l3 {
  0% {
    inset: 0 35px 0 0;
  }
  50% {
    inset: 0 0 0 0;
  }
  100% {
    inset: 0 0 0 35px;
  }
}
</style>
