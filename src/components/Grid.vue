<template>
    <VGrid ref="grid" resize readonly :columns="columns" :source="source" hide-attribution :theme="theme" />
</template>
<script lang="ts" setup>
import { VGrid, type ColumnRegular } from '@revolist/vue3-datagrid'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { ParsedData } from '../services/versions.types';
const grid = ref<{ $el: HTMLRevoGridElement } | null>(null);

const columns: ColumnRegular[] = [{
    name: 'URL',
    prop: 'url',
    size: 300,
}, {
    name: 'Public Version',
    prop: 'sgt5PublicVersion',
    size: 150
}, {
    name: 'Backend',
    prop: 'servers',
    size: 350,
    cellTemplate: (_, { value }) => {
        return (value as ParsedData['servers'])?.map(v => v.version).join(', ')
    }
}, {
    name: 'License',
    prop: 'licenseInfo',
    size: 350
}]
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
