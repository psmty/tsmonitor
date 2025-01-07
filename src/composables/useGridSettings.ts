import type {Ref} from 'vue';
import {SideBarType} from './useSideBar.ts';

export const useGridSettings = (visibleSideBar: Ref<boolean>, sideBarType: Ref<SideBarType | null>, sideBarTitle: Ref<string>) => {
  const startGridSettings = () => {
    sideBarType.value = SideBarType.Settings;
    sideBarTitle.value = 'Grid Settings';
    visibleSideBar.value = true;
  };

  return {
    startGridSettings,
  };
}
