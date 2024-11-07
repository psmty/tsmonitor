import type { ColumnDataSchemaModel, ColumnRegular, HyperFunc, VNode } from '@revolist/vue3-datagrid';
import { CustomFieldsName } from '../services/consts';
import type { Ref } from 'vue';
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

const YES_NO = (h: HyperFunc<VNode>, { value, type }: ColumnDataSchemaModel) => {
  if (type === 'rowPinStart') {
    return '';
  }
  return value ? YES(h) : NO(h);
}

const YES_NO_OPT = (h: HyperFunc<VNode>, { value, type }: ColumnDataSchemaModel) => {
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

export const GRID_COLUMNS: ColumnRegular[] = [
  {
    name: CustomFieldsName.Customer,
    prop: 'customer',
    size: 300,
    sortable: true,
  },
  {
    name: CustomFieldsName.URL,
    prop: 'url',
    size: 300,
    sortable: true,
    cellTemplate: (h, { value }) => {
      return h('a', { class: 'font-medium hover:underline text-primary-600 dark:text-primary-500', href: value, target: '_blank' }, value?.replace('https://', ''));
    }
  },
  {
    name: CustomFieldsName.Integrations,
    prop: 'hasIntegration',
    size: 250,
    sortable: true,
    cellTemplate: YES_NO_OPT
  },
  {
    name: CustomFieldsName.Environment,
    prop: 'environment',
    size: 150,
    sortable: true,
  },
  {
    name: CustomFieldsName.Csm,
    prop: 'csm',
    size: 150,
    sortable: true,
  },
  {
    name: 'Version',
    prop: 'sgt5PublicVersion',
    size: 150,
    sortable: true,
  },
  {
    name: 'Resource',
    prop: 'resource',
    size: 150,
    sortable: true,
  },
  {
    name: 'SG Users',
    prop: 'sgUsers',
    size: 150,
    sortable: true,
    cellTemplate: NEGATIVE_CHECK
  },
  {
    name: 'TS Users',
    prop: 'tsUsers',
    size: 150,
    sortable: true,
    cellTemplate: NEGATIVE_CHECK
  },
  {
    name: 'Online',
    prop: 'online',
    size: 150,
    sortable: true,
    cellTemplate: YES_NO
  },
  {
    name: 'Sync Running',
    prop: 'syncRunning',
    size: 150,
    sortable: true,
    cellTemplate: YES_NO_OPT
  },
  {
    name: 'I+',
    prop: 'insightsRunning',
    size: 150,
    sortable: true,
    cellTemplate: YES_NO_OPT
  },
  {
    name: 'Cleanup',
    prop: 'cleanupRunning',
    size: 150,
    sortable: true,
    cellTemplate: YES_NO_OPT
  },
  {
    name: 'Api notification',
    prop: 'apinotificationRunning',
    size: 150,
    sortable: true,
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
    name: 'Backend date',
    prop: 'date',
    size: 350,
    sortable: true,
  },
];

const CHECKBOX_CLASS = "w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600";
export const CHECKBOX_COLUMN = (selectedRows: Ref<Set<string>>, source: Ref<any[]>): ColumnRegular => ({
  name: "",
  prop: "checkbox",
  size: 50,
  sortable: false,
  filter: false,
  // pin: "colPinStart",
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
