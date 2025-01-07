import {ref} from 'vue';

export enum SideBarType {
  Edit = 'Edit',
  Delete = 'Delete',
  ChooseColumn = 'ChooseColumn',
  Settings = 'Settings',
}


export const useSideBar = () => {
  const visibleSideBar = ref(false);
  const sideBarType = ref<SideBarType | null>(null);
  const sideBarTitle = ref('');

  const clearSideBarType = () => {
    sideBarType.value = null;
  };

  const hideSidebar = () => {
    visibleSideBar.value = false;
  };

  return {
    visibleSideBar,
    sideBarType,
    sideBarTitle,
    hideSidebar,
    clearSideBarType
  };
};
