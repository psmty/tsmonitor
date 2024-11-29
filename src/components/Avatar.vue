<template>
<div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
  {{getNameSymbols}}
</div>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import {getNameInitials, isInitialsAllowed} from '../services';

const props = defineProps<{
  name: string
}>()

const getNameSymbols = computed(() => {
  return isInitialsAllowed(getNameInitials(props.name))
})
</script>
