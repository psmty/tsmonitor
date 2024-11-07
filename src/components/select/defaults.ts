export type SelectItemId = string|null;
export type SelectSource = {value: string, id: SelectItemId};

export const EMPTY_ID = 'EMPTY_ID';

export const booleanDataSource: SelectSource[] = [{value: 'Yes', id: 'true'}, {value: 'No', id: 'false'}];
