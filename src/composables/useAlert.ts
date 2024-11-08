import {readonly, ref} from 'vue';

export enum AlertType {
  Warning = 'warning',
  Error = 'error',
}

const WARNING_TIMEOUT_TIME = 5000;

const store = ref({
  visible: false,
  text: '',
  type: AlertType.Warning,
});

let ticker: NodeJS.Timeout;
export const showAlert = (text: string, type: AlertType) => {
  store.value.type = type;
  store.value.text = text;
  store.value.visible = true;

  if (type === AlertType.Warning) {
    ticker = setTimeout(() => {
      hideAlert();
    }, WARNING_TIMEOUT_TIME)
  }
}

export const hideAlert = () => {
  store.value.visible = false;
  store.value.text = '';
}

export const useAlert = () => {
  return {state: readonly(store), hideAlert, showAlert};
}
