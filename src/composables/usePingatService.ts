import {debounce, getTimeDifference} from '../services';
import {nextTick, type Ref} from 'vue';

export const PING_AT_TIME_CLASS = 'pingat-timediff';

export const getTimeDiffString = (timeDiff: string) => {
  return `(${timeDiff})`;
}


export const usePingatService = (grid: Ref<{ $el: HTMLRevoGridElement } | null>) => {
  let worker: Worker | null = null;

  const updateTimeDiff = () => {
    const pingCells = document.querySelectorAll(`.${PING_AT_TIME_CLASS}`);
    pingCells.forEach(cell => {
      if (!(cell instanceof HTMLElement)) {
        return;
      }

      const pingat = cell.getAttribute('data-pingat');
      if (!pingat) {
        return;
      }

      const timeDiff = getTimeDifference(new Date(pingat), new Date());

      const existingTimeDiff = cell.innerText;
      const newTimeDiff = getTimeDiffString(timeDiff);

      if (existingTimeDiff !== newTimeDiff) {
        cell.innerText = newTimeDiff;
      }
    });
  };

  const debouncedTimeDiff = debounce(updateTimeDiff, 10);

  const initPingatService = () => {
    worker = new Worker(new URL(
      '../services/pingatCounter.worker.ts',
      import.meta.url
    ));

    worker.onmessage = () => {
      updateTimeDiff();
    }

    worker?.postMessage('init');
  };

  const stopPingatService = () => {
    if (worker === null) {
      return;
    }

    worker.terminate();
  };

  const updatePingat = async () => {
    await nextTick();
    debouncedTimeDiff();
  };

  return {
    initPingatService,
    stopPingatService,
    updatePingat
  };
};
