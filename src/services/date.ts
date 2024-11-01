export function localJsDateToDateString(localJsDate: Date): string;
export function localJsDateToDateString(localJsDate: null | undefined): null;
export function localJsDateToDateString(localJsDate: Date | null): string | null;
export function localJsDateToDateString(localJsDate: Date | undefined): string | null;
export function localJsDateToDateString(localJsDate: Date | null | undefined): string | null {
  if (!(localJsDate instanceof Date)) {
      return null;
  }

  const offset = localJsDate.getTimezoneOffset();
  const utcDate = new Date(localJsDate.getTime() - (offset * 60 * 1000));
  const dateString = utcDate.toISOString().split('T')[0];

  return dateString;
}

export function dateStringToLocalJsDate(dateString: string): Date;
export function dateStringToLocalJsDate(dateString: null | undefined): null;
export function dateStringToLocalJsDate(dateString: string | null): Date | null;
export function dateStringToLocalJsDate(dateString: string | undefined): Date | null;
export function dateStringToLocalJsDate(dateString: string | null | undefined): Date | null {
  if (typeof dateString !== 'string') {
      return null;
  }

  const utcDate = new Date(dateString);
  const offset = utcDate.getTimezoneOffset();
  const localJsDate = new Date(utcDate.getTime() + (offset * 60 * 1000));

  return localJsDate;
}
