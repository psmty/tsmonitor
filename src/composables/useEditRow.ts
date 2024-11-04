import { ref, type Ref} from 'vue';
import {SideBarType} from './useSideBar.ts';

export function useEditRow(visibleSideBar: Ref<boolean>, sideBarType: Ref<SideBarType | null>, sideBarTitle: Ref<string>) {
  const title = 'Update row';
  const editUrl = ref<string | null>(null);
  const startEditRow = (url: string) => {
    sideBarType.value = SideBarType.Edit;
    sideBarTitle.value = title;
    editUrl.value = url;
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
