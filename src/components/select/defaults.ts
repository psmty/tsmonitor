import {createStringDataSource} from './helpers.ts';
import {Environment} from '../../services/consts.ts';

export type SelectItemId = string|null;
export type SelectSource = {value: string, id: SelectItemId};

export const EMPTY_ID = 'EMPTY_ID';

export const booleanDataSource: SelectSource[] = [{value: 'Yes', id: 'true'}, {value: 'No', id: 'false'}];

export const environmentDataSource: SelectSource[] = createStringDataSource([Environment.Dev, Environment.Prod, Environment.Trial]);

export const getResourceDataSource = (resources: string[]): SelectSource[] => createStringDataSource(resources);
