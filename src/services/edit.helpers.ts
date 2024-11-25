import {DEFAULT_SETTINGS} from './edit.defaults.ts';

export function isCustomField(prop: string) {
  return Object.hasOwnProperty.call(DEFAULT_SETTINGS, prop);
}
