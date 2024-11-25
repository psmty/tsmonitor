import {type Editors, VGridVueEditor} from '@revolist/vue3-datagrid';
import SelectEditorVue from './SelectEditor.vue';

export const SelectEditor = 'selectEditor';

export const GRID_EDITORS: Editors = {
  [SelectEditor]: VGridVueEditor(SelectEditorVue)
};
