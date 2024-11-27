import type {App} from 'vue';
import {AlertType, showAlert} from '../composables/useAlert.ts';
export default (app: App) => {
  // Set up global error handling
  app.config.errorHandler = (error, vm, info) => {
    console.error("Error: ", error, "Info: ", info);
    showAlert('Unknown error', AlertType.Error);
  };
};
