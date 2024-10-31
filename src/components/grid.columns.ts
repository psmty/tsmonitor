import type { ColumnRegular } from '@revolist/vue3-datagrid';

export const GRID_COLUMNS: ColumnRegular[] = [
  {
    name: 'Customer',
    prop: 'customer',
    size: 300,
    sortable: true,
  },
  {
    name: 'Instance',
    prop: 'url',
    size: 300,
    sortable: true,
  },
  {
    name: 'Integrations',
    prop: 'integrations',
    size: 300,
    sortable: true,
  },
  {
    name: 'Version',
    prop: 'sgt5PublicVersion',
    size: 150,
    sortable: true,
  },
  {
    name: 'SG Users',
    prop: 'sgUsers',
    size: 150,
    sortable: true,
  },
  {
    name: 'TS Users',
    prop: 'tsUsers',
    size: 150,
    sortable: true,
  },
  {
    name: 'Online',
    prop: 'online',
    size: 150,
    sortable: true,
  },
  {
    name: 'Sync',
    prop: 'syncRunning',
    size: 150,
    sortable: true,
  },
  {
    name: 'I+',
    prop: 'insightsRunning',
    size: 150,
    sortable: true,
  },
  {
    name: 'Cleanup',
    prop: 'cleanupRunning',
    size: 150,
    sortable: true,
  },
  {
    name: 'Api notification',
    prop: 'apinotificationRunning',
    size: 150,
    sortable: true,
  },
  {
    name: 'License',
    prop: 'licenseInfo',
    size: 350,
    cellTemplate: (_, { value }) => {
      if (!value) {
        return '';
      }
      return JSON.stringify(value, null, 2);
    }
  },
  {
    name: 'Backend date',
    prop: 'date',
    size: 350,
    sortable: true,
  },
];
