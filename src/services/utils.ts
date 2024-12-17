export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keysToOmit: K[]
): Omit<T, K> {
  const result = {} as Omit<T, K>;

  for (const key of Object.keys(obj)) {
    if (!keysToOmit.includes(key as K)) {
      result[key as keyof Omit<T, K>] = obj[key];
    }
  }

  return result;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null;

  return function (...args: Parameters<T>) {
    const context = this;

    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    const callNow = immediate && !timeout;

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };
}

type KeyByCallback<T> = (item: T) => string | number;

export function keyBy<T>(array: T[], keyGetter: KeyByCallback<T>): Record<string | number, T> {
  return array.reduce((result, item) => {
    const key = keyGetter(item);
    result[key] = item;
    return result;
  }, {} as Record<string | number, T>);
}

export function groupBy<T, K extends keyof any, V>(
  array: T[],
  keyFn: (item: T) => K,
  valueFn: (item: T) => V
): Record<K, Array<V>> {
  return array.reduce((result, item) => {
    const key = keyFn(item);
    const value = valueFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(value);
    return result;
  }, {} as Record<K, Array<V>>);
}

/**
 * Sorts an array of objects based on an array of values for a specific key.
 *
 * @param items - Array of objects to be sorted.
 * @param order - Array of values representing the desired order.
 * @param key - The key in the objects whose values will be compared.
 * @returns A sorted array of objects.
 */
export function sortByOrder<T, K extends keyof T>(
  items: T[],
  order: (T[K])[],
  key: K
): T[] {
  const orderMap = new Map(order.map((value, index) => [value, index]));

  return [...items].sort((a, b) => {
    const indexA = orderMap.get(a[key]) ?? Number.MAX_SAFE_INTEGER;
    const indexB = orderMap.get(b[key]) ?? Number.MAX_SAFE_INTEGER;

    return indexA - indexB;
  });
}
