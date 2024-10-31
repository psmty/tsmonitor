<template>
    <VGrid class="grow" ref="grid" resize readonly :columns="columns" :source="source" hide-attribution :theme="theme" />
</template>
<script lang="ts" setup>
import { VGrid } from '@revolist/vue3-datagrid'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { ParsedData } from '../services/versions.types';
import { GRID_COLUMNS } from './grid.columns';
const grid = ref<{ $el: HTMLRevoGridElement } | null>(null);

interface Props {
  data: Map<string, ParsedData>
}

const props = defineProps<Props>();
const emits = defineEmits<{
  (e: 'loadSource'): void
}>()

const columns = [...GRID_COLUMNS]
const theme = ref('compact')

const checkTheme = () => {
    if (
            document.documentElement.classList.contains('dark')) {
                theme.value = 'darkCompact'
            } else {
                theme.value = 'compact'
            }
}
onMounted(() => {
    checkTheme()
    document.addEventListener('dark-mode', () => {
        checkTheme()
    })
})
const source = computed(() => props.data.values())
</script>
