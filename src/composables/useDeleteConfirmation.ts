import {type Ref, ref} from 'vue';
import {SideBarType} from './useSideBar.ts';

export const useDeleteConfirmation = (visibleSideBar: Ref<boolean>, sideBarType: Ref<SideBarType | null>, sideBarTitle: Ref<string>) => {
  const title = 'Delete row';
  const deleteUrls = ref<string[]>([]);

  const startDeleteRow = (urls: string[]) => {
    sideBarTitle.value = title;
    deleteUrls.value = urls;
    sideBarType.value = SideBarType.Delete;
    visibleSideBar.value = true;
  };

  const endDeleteRow = () => {
    deleteUrls.value = [];
  };

  return {
    deleteUrls,
    startDeleteRow,
    endDeleteRow
  };
};
