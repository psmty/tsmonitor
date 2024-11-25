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
