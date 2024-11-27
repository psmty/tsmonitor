import {computed, ref, type Ref} from 'vue';
import {SideBarType} from './useSideBar.ts';

export function useEditRow(visibleSideBar: Ref<boolean>, sideBarType: Ref<SideBarType | null>, sideBarTitle: Ref<string>) {
  const editUrls = ref<Array<string> | null>(null);
  const title = computed(() => editUrls.value === null ? 'Add url' : 'Update row')
  const startEditRow = (urls?: Array<string>) => {
    sideBarType.value = SideBarType.Edit;
    editUrls.value = urls ?? null;
    sideBarTitle.value = title.value;
    visibleSideBar.value = true;
  };

  const endEditRow = () => {
    editUrls.value = null;
  };

  return {
    editUrls,
    startEditRow,
    endEditRow
  };
}
