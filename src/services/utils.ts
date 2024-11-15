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
