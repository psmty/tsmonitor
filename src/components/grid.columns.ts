import type { CellCompareFunc, ColumnDataSchemaModel, ColumnRegular, DataType, HyperFunc, VNode } from '@revolist/vue3-datagrid';
import {CustomFieldsName} from '../services/consts';
import type { Ref } from 'vue';
import {booleanDataSource, environmentDataSource, getResourceDataSource} from './select/defaults.ts';
import {BooleanEditor, SelectEditor} from './gridEditors/editors.ts';
import {getTimeDifference} from '../services';
import {getTimeDiffString, PING_AT_TIME_CLASS} from '../composables/usePingatService.ts';
const YES_CLASS = 'bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-md dark:bg-gray-700 dark:text-green-400 border border-green-100 dark:border-green-500';
const NO_CLASS = 'bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-md border border-red-100 dark:border-red-400 dark:bg-gray-700 dark:text-red-400';
const NO_OPT_CLASS = 'bg-purple-100 text-purple-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-md border border-purple-100 dark:bg-gray-700 dark:border-purple-500 dark:text-purple-400';
const YES = (h: HyperFunc<VNode>) => {
  return h('span', { class: YES_CLASS }, 'Yes');
}

const NO = (h: HyperFunc<VNode>, optional?: boolean) => {
  return h('span', { class: {
    [NO_CLASS]: !optional,
    [NO_OPT_CLASS]: optional
  } }, 'No');
}

export const YES_NO = (h: HyperFunc<VNode>, { value, type }: Pick<ColumnDataSchemaModel, 'value'|'type'>) => {
  if (type === 'rowPinStart') {
    return '';
  }
  return value ? YES(h) : NO(h);
}

export const YES_NO_OPT = (h: HyperFunc<VNode>, { value, type }: Pick<ColumnDataSchemaModel, 'value'|'type'>) => {
  if (type === 'rowPinStart') {
    return '';
  }
  return value ? YES(h) : NO(h, true);
}

const NEGATIVE_CHECK = (h: HyperFunc<VNode>, { value }: { value?: number }) => {
  if (typeof value !== 'undefined' && value < 0) {
    return h('span', { class: 'text-sm text-red-600 dark:text-red-500' }, value.toString());
  } else {
    return value ?? '';
  }
}

export const URL_PROP = 'url';

const cellCompare: CellCompareFunc = (prop: string, a: DataType, b: DataType) => {
  const aVal = a?.[prop];
  const bVal = b?.[prop];

  // Handle numeric values
  if (typeof aVal === 'number' && typeof bVal === 'number') {
    return aVal - bVal;
  }

  // Convert to lowercase strings for string comparison
  const av = aVal?.toString().toLowerCase();
  const bv = bVal?.toString().toLowerCase();

  if (av === bv) {
    return 0;
  }
  if (av > bv) {
    return 1;
  }
  return -1;
}

export const getGridColumns = ({resources, highlightVersion}: {resources: string[], highlightVersion?: Ref<string>}):ColumnRegular[] => [
  {
    name: CustomFieldsName.Customer,
    prop: 'customer',
    size: 300,
    sortable: true,
    readonly: false,
  },
  {
    name: CustomFieldsName.URL,
    prop: 'url',
    size: 300,
    sortable: true,
    readonly: false,
    cellTemplate: (h, { value }) => {
      return h('a', { class: 'font-medium hover:underline text-primary-600 dark:text-primary-500', href: value, target: '_blank' }, value?.replace('https://', ''));
    }
  },
  {
    name: CustomFieldsName.Integrations,
    prop: 'hasIntegration',
    size: 250,
    sortable: true,
    readonly: false,
    editor: BooleanEditor,
    getOptions: () => booleanDataSource,
    cellTemplate: YES_NO_OPT
  },
  {
    name: CustomFieldsName.Environment,
    prop: 'environment',
    size: 150,
    sortable: true,
    readonly: false,
    editor: SelectEditor,
    getOptions: () => environmentDataSource
  },
  {
    name: CustomFieldsName.Csm,
    prop: 'resource',
    size: 150,
    sortable: true,
    readonly: false,
    editor: SelectEditor,
    getOptions: () => getResourceDataSource(resources)
  },
  {
    name: 'Version',
    prop: 'sgt5PublicVersion',
    size: 150,
    sortable: true,
    readonly: true,
    cellProperties: ({ value }) => ({class: {"font-medium text-primary-600 dark:text-primary-500 !text-black !bg-green-300 dark:!bg-green-300": highlightVersion?.value === value}}),
  },
  {
    name: 'Major version',
    prop: 'sgt5PublicVersionMajor',
    size: 150,
    sortable: true,
    readonly: true,
    cellProperties: ({ value }) => ({class: {"font-medium text-primary-600 dark:text-primary-500 !text-black !bg-green-300 dark:!bg-green-300": highlightVersion?.value === value}}),
  },
  {
    name: 'SG Total Resources',
    prop: 'sgTotalResource',
    size: 150,
    sortable: true,
    readonly: true,
    cellCompare,
  },
  {
    name: 'SG Enabled Resources',
    prop: 'sgEnabledResource',
    size: 150,
    sortable: true,
    readonly: true,
  },
  {
    name: 'SG Team Resources',
    prop: 'sgTeamResource',
    size: 150,
    sortable: true,
    readonly: true,
    cellCompare,
  },
  {
    name: 'SG Delta Resources',
    prop: 'sgUsers',
    size: 150,
    sortable: true,
    readonly: true,
    cellTemplate: NEGATIVE_CHECK,
  },
  {
    name: 'SG Enabled With Credentials',
    prop: 'sgEnabledResourceWithCredentials',
    size: 150,
    sortable: true,
    readonly: true,
    cellCompare,
  },
  {
    name: 'License Limit',
    prop: 'licenseLimit',
    size: 150,
    sortable: true,
    readonly: true,
    cellCompare,
  },

  {
    name: 'TS Total Resources',
    prop: 'tsTotalResource',
    size: 150,
    sortable: true,
    readonly: true,
    cellCompare,
  },
  {
    name: 'TS Enabled Resources',
    prop: 'tsEnabledResource',
    size: 150,
    sortable: true,
    readonly: true,
    cellCompare,
  },
  {
    name: 'TS Delta Resources',
    prop: 'tsUsers',
    size: 150,
    sortable: true,
    readonly: true,
    cellTemplate: NEGATIVE_CHECK,
    cellCompare,
  },
  {
    name: 'Days Left',
    prop: 'daysLeft',
    sortable: true,
    readonly: true,
    size: 150,
    cellCompare: (prop, a, b) => parseInt(a[prop] || '-1', 10) - parseInt(b[prop] || '-1', 10),
    cellTemplate: (h, { value }) => {
      if (isNaN(parseInt(value, 10))) {
        return '-';
      }
      const date = new Date();
      date.setDate(date.getDate() + parseInt(value, 10));
      return h('span', null, [value, h('span', { class: 'text-xs text-gray-500 dark:text-gray-400' }, ` (${date.toLocaleDateString()})`)]);
    }
  },
  {
    name: 'Online',
    prop: 'online',
    size: 150,
    sortable: true,
    readonly: true,
    cellTemplate: YES_NO
  },
  {
    name: 'Sync Running',
    prop: 'syncRunning',
    size: 150,
    sortable: true,
    readonly: true,
    cellTemplate: YES_NO_OPT
  },
  {
    name: 'I+',
    prop: 'insightsRunning',
    size: 150,
    sortable: true,
    readonly: true,
    cellTemplate: YES_NO_OPT
  },
  {
    name: 'Cleanup',
    prop: 'cleanupRunning',
    size: 150,
    sortable: true,
    readonly: true,
    cellTemplate: YES_NO_OPT
  },
  {
    name: 'Api notification',
    prop: 'apinotificationRunning',
    size: 150,
    sortable: true,
    readonly: true,
    cellTemplate: YES_NO_OPT
  },
  // {
  //   name: 'License',
  //   prop: 'licenseInfo',
  //   size: 350,
  //   cellTemplate: (_, { value }) => {
  //     if (!value) {
  //       return '';
  //     }
  //     return JSON.stringify(value, null, 2);
  //   }
  // },
  {
    name: 'Last ping',
    prop: 'pingat',
    size: 350,
    sortable: true,
    readonly: true,
    cellTemplate: (h, { value }) => {
      if (!value) {
        return '';
      }

      const pingat = new Date(value).toLocaleString();
      const timeDiff = getTimeDifference(new Date(value), new Date())
      return h('span', null, [
        h('span', {class: 'mr-2'}, pingat),
        h('span', {
          class: PING_AT_TIME_CLASS,
          ['data-pingat']: value,
        }, getTimeDiffString(timeDiff))
      ])
    }
  },
];

const CHECKBOX_CLASS = "w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600";
export const CHECKBOX_COLUMN = (selectedRows: Ref<Set<string>>, source: Ref<any[]>): ColumnRegular => ({
  name: "",
  prop: "checkbox",
  size: 50,
  sortable: false,
  readonly: true,
  filter: false,
  // pin: "colPinStart", // doesn't look good with grouping
  columnTemplate: (h, p) => {
    const selected = selectedRows.value.size === source.value.length;
    return h('input', {
      type: "checkbox",
      checked: selected,
      class: CHECKBOX_CLASS,
      onChange: (e: Event & { target: HTMLInputElement }) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.target.checked) {
          source.value.map(i => selectedRows.value.add(i.url));
        } else {
          selectedRows.value.clear();
        }
      }
    });
  },
  cellTemplate: (h, p) => {
    const url = p.model.url;
    const selected = selectedRows.value.has(url);
    return h('input', {
      type: "checkbox",
      class: CHECKBOX_CLASS,
      checked: selected,
      key: url,
      onChange: (e: Event & { target: HTMLInputElement }) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.target.checked) {
          selectedRows.value.add(url);
        } else {
          selectedRows.value.delete(url);
        }
      }
    });
  }
});
