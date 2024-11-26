import {computed, ref, type Ref} from 'vue';
import {SideBarType} from './useSideBar.ts';

export function useEditRow(visibleSideBar: Ref<boolean>, sideBarType: Ref<SideBarType | null>, sideBarTitle: Ref<string>) {
  const editUrl = ref<string | null>(null);
  const title = computed(() => editUrl.value === null ? 'Add url' : 'Update row')
  const startEditRow = (url?: string) => {
    sideBarType.value = SideBarType.Edit;
    editUrl.value = url ?? null;
    sideBarTitle.value = title.value;
    visibleSideBar.value = true;
  };

  const endEditRow = () => {
    editUrl.value = null;
  };

  return {
    editUrl,
    startEditRow,
    endEditRow
  };
}
