<template>
    <button
        type="button"
        id="updateProductButton"
        data-drawer-target="drawer-update-product-default"
        data-drawer-show="drawer-update-product-default"
        aria-controls="drawer-update-product-default"
        data-drawer-placement="right"
        class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
    @click="exportToExcel">Export</button>
    <VGrid ref="grid" readonly :columns="columns" :source="props.data" :plugins="plugins" hide-attribution :theme="theme" />
</template>
<script lang="ts" setup>
import { VGrid, type ColumnRegular } from '@revolist/vue3-datagrid'
import { onMounted, ref } from 'vue';
import type { ParsedData } from '../services/versions.types';
import { ExportExcelPlugin } from './plugins/export-excel';
const grid = ref<{ $el: HTMLRevoGridElement } | null>(null);
const props = defineProps({
    data: {
        type: Array<ParsedData>,
    }
})
const plugins = [ExportExcelPlugin]
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
    cellTemplate: (h, { value }) => {
        return (value as ParsedData['servers'])?.map(v => v.version).join(', ')
    }
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
const exportConfig = { sheetName: 'my-file.xlsx' }

const exportToExcel = async () => {
  if (grid.value) {
    const plugins = await grid.value.$el.getPlugins()
    const exportPlugin = plugins.find(
      (plugin) => plugin instanceof ExportExcelPlugin
    ) as ExportExcelPlugin
    exportPlugin?.export(exportConfig)
  }
}
onMounted(() => {
    console.log(props.data)
    checkTheme()
    document.addEventListener('dark-mode', () => {
        checkTheme()
    })
})
</script>
