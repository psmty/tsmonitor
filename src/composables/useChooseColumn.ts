import {computed, type Ref, ref} from 'vue';
import {SideBarType} from './useSideBar.ts';
import {getGridColumns, URL_PROP} from '../components/grid.columns.ts';

export const useChooseColumn = <T extends { selectedColumns: Array<string | number> }>(
  visibleSideBar: Ref<boolean>,
  sideBarType: Ref<SideBarType | null>,
  sideBarTitle: Ref<string>,
  personalization: Readonly<Ref<T>>,
  setPersonalizationValue: (key: keyof T, value: T[keyof T]) => Promise<void>,
  resources: string[]
) => {
  const gridColumnsSource = [...getGridColumns({resources})];
  const title = 'Choose Column';

  const selectedColumns = computed<Set<string | number>>({
    get: () => {
      return new Set(personalization.value?.selectedColumns ?? []);
    },
    set: async (newValue) => {
      const selectedArray = Array.from(newValue) as T[keyof T];
      await setPersonalizationValue('selectedColumns', selectedArray);
    }
  });

  const columnSelectorSource = computed(() => {
    return gridColumnsSource.map(c => ({
      name: String(c.name),
      id: String(c.prop)
    })).filter(c => c.id !== URL_PROP);
  });

  const gridColumns = computed(() => {
    return gridColumnsSource.filter(c => c.prop === URL_PROP || selectedColumns.value.has(c.prop));
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
    startChoosingColumn
  };
};
