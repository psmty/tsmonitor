import type { LogicFunction, LogicFunctionParam } from "@revolist/revogrid";

const contains: LogicFunction<LogicFunctionParam, Array<any> | undefined> = (value, extra) => {
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
    return extra.includes(value.toLocaleLowerCase());
  }
  return true;
};

export const notContains: LogicFunction<LogicFunctionParam, Array<any> | undefined> = (value, extra) => {
  return !contains(value, extra);
};

