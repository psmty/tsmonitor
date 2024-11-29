export const classObjectFromClassProp = (cls?: string | Record<string, boolean>) => {
  if (typeof cls === 'string') {
    cls = cls.split(' ')
      .filter((localCls) => !!localCls)
      .reduce<Record<string, boolean>>((acc, localCls) => {
        acc[localCls] = true;
        return acc;
      }, {});
  }

  return cls || {};
};
