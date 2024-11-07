import type {SelectSource} from './defaults.ts';

export function createStringDataSource(source: string[]): Array<SelectSource> {
  return source.map((item) => ({value: item, id: item}))
}

export function setBooleanValue(booleanString: string): boolean {
  return booleanString === 'true';
}
