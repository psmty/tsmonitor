import type { ColumnRegular } from '@revolist/vue3-datagrid';
import type { ParsedData } from '../services/versions.types';

export const GRID_COLUMNS: ColumnRegular[] = [
  {
    name: 'Customer',
    prop: 'customer',
    size: 300,
  },
  {
    name: 'Instance',
    prop: 'url',
    size: 300,
  },
  {
    name: 'Integrations',
    prop: 'integrations',
    size: 300,
  },
  {
    name: 'Version',
    prop: 'sgt5PublicVersion',
    size: 150,
  },
  {
    name: 'SG Users',
    prop: 'sgusers',
    size: 150,
  },
  {
    name: 'TS Users',
    prop: 'tsusers',
    size: 150,
  },
  {
    name: 'RDP',
    prop: 'rdp',
    size: 150,
  },
  {
    name: 'Online',
    prop: 'online',
    size: 150,
  },
  {
    name: 'Sync service',
    prop: 'sync',
    size: 150,
  },
  {
    name: 'Backend',
    prop: 'servers',
    size: 350,
    cellTemplate: (_, { value }) => {
      return (value as ParsedData['servers'])?.map((v) => v.version).join(', ');
    },
  },
  {
    name: 'License',
    prop: 'licenseInfo',
    size: 350,
  },
];
