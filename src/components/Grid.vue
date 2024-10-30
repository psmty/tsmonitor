<template>
    <VGrid ref="grid" resize readonly :columns="columns" :source="source" hide-attribution :theme="theme" />
</template>
<script lang="ts" setup>
import { VGrid, type ColumnRegular } from '@revolist/vue3-datagrid'
import { onMounted, ref } from 'vue';
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
const source = ref<Array<ParsedData>>([])

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
const loadSource = async () => {
    const response = await fetch("/api/list");
    source.value = await response.json();
}
</script>
