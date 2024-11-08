import type { LogicFunction, LogicFunctionParam } from "@revolist/revogrid";

const contains: LogicFunction<LogicFunctionParam, Set<any> | undefined> = (value, extra) => {
  if (!extra) {
    return true;
  }
  if (!value) {
    value = '';
  }
  if (extra) {
    if (typeof value !== 'string') {
      value = JSON.stringify(value);
    }
    return extra.has(value.toLocaleLowerCase());
  }
  return true;
};

export const notContains: LogicFunction<LogicFunctionParam, Set<any> | undefined> = (value, extra) => {
  return !contains(value, extra);
};

