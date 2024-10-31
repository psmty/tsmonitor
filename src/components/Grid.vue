<template>
    <VGrid class="grow" ref="grid" resize readonly :columns="columns" :source="source" hide-attribution :theme="theme" />
</template>
<script lang="ts" setup>
import { VGrid } from '@revolist/vue3-datagrid'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { ParsedData } from '../services/versions.types';
import { GRID_COLUMNS } from './grid.columns';
const grid = ref<{ $el: HTMLRevoGridElement } | null>(null);

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
    loadSource()
})
const source = computed(() => data.value.values())
const data = ref(new Map<string, ParsedData>())

const crawler = async (urls: string[] = []) => {
    const response = await fetch("/api/crawler", {
        method: 'POST', body: JSON.stringify(urls)});
    const sites: ParsedData[] = await response.json();
    console.log(sites)
    data.value = new Map(sites.map(v => [v.url, v]))
}

let interval: NodeJS.Timeout | null = null
const loadSource = async () => {
    const response = await fetch("/api/list");
    const sites: ParsedData[] = await response.json();
    data.value = new Map(sites.map(v => [v.url, v]))
    const urls: string[] = Array.from(data.value.keys())

    interval = setInterval(() => crawler(urls), 5 * 60 * 1000)
    crawler(urls)
}

onBeforeUnmount(() => {
    if (interval) {
        clearInterval(interval)
    }
})
</script>
