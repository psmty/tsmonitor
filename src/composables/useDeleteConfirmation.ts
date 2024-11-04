import {type Ref, ref} from 'vue';
import {SideBarType} from './useSideBar.ts';

export const useDeleteConfirmation = (visibleSideBar: Ref<boolean>, sideBarType: Ref<SideBarType | null>, sideBarTitle: Ref<string>) => {
  const title = 'Delete row';
  const deleteUrls = ref<string[]>([]);

  const startDeleteRow = (url: string) => {
    sideBarTitle.value = title;
    deleteUrls.value = [url];
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
