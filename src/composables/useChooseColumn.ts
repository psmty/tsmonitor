import {computed, type Ref, ref, watch} from 'vue';
import {SideBarType} from './useSideBar.ts';
import {getGridColumns, URL_PROP} from '../components/grid.columns.ts';
import { EMPTY_ID } from '../components/select/defaults.ts';
import type {ColumnProp} from '@revolist/vue3-datagrid';
import {sortByOrder} from '../services';

export const useChooseColumn = <T extends { selectedColumns?: Array<string | number>, columnOrder?: ColumnProp[] }>(
  visibleSideBar: Ref<boolean>,
  sideBarType: Ref<SideBarType | null>,
  sideBarTitle: Ref<string>,
  personalization: Readonly<Ref<T>>,
  setPersonalizationValue: (key: keyof T, value: T[keyof T]) => Promise<void>,
  resources: string[]
) => {
  const highlightVersion = ref(EMPTY_ID);
  const gridColumnsSource = [...getGridColumns({ resources , highlightVersion })];
  const title = 'Choose Column';

  const columnOrder = computed(() => personalization.value?.columnOrder ?? null);

  const selectedColumns = computed<Set<string | number>>({
    get: () => {
      return new Set(personalization.value?.selectedColumns ?? []);
    },
    set: async (newValue) => {
      const selectedArray = Array.from(newValue) as T[keyof T];
      await setPersonalizationValue('selectedColumns', selectedArray);
    }
  });

  /**
   * Don't trigger column redraw on each sort
   */
  const initialColumnSort = ref<ColumnProp[] | null>(null);
  const sortedColumnsUnsubscribe = watch(
    columnOrder,
    (newValue) => {
      initialColumnSort.value = newValue;
      sortedColumnsUnsubscribe();
    },
    { immediate: false, flush: 'sync' }
  );

  const columnSelectorSource = computed(() => {
    let source =  gridColumnsSource.filter(c => c.prop !== URL_PROP);
    if (columnOrder.value) {
      // If column order saved in personalization we need to sort columns
      source = sortByOrder(source, columnOrder.value, 'prop');
    } else {
      source = source.sort((a, b) => a.name.localeCompare(b.name))
    }

    return source.map(c => ({
      name: String(c.name),
      id: String(c.prop)
    }));
  });

  const gridColumns = computed(() => {
    const source =  gridColumnsSource.filter(c => c.prop === URL_PROP || selectedColumns.value.has(c.prop));
    if (initialColumnSort.value) {
      // If column order saved in personalization we need to sort columns
      return sortByOrder(source, initialColumnSort.value, 'prop');
    }

    return source;
  });

  const startChoosingColumn = () => {
    sideBarTitle.value = title;
    sideBarType.value = SideBarType.ChooseColumn;
    visibleSideBar.value = true;
  };


  return {
    columns: gridColumns,
    selectedColumns,
    gridColumnsSource,
    columnSelectorSource,
    highlightVersion,
    startChoosingColumn
  };
};
