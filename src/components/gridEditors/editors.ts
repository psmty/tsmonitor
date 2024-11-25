import {type Editors, VGridVueEditor} from '@revolist/vue3-datagrid';
import SelectEditorVue from './SelectEditor.vue';
import BooleanEditorVue from './BooleanEditor.vue';

export const SelectEditor = 'selectEditor';
export const BooleanEditor = 'booleanEditor';

export const GRID_EDITORS: Editors = {
  [SelectEditor]: VGridVueEditor(SelectEditorVue),
  [BooleanEditor]: VGridVueEditor(BooleanEditorVue),
};
