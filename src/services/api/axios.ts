import axios, {type AxiosError, type AxiosResponse} from 'axios';
import {isExpectedError} from './server.validation.ts';
import {AlertType, showAlert} from '../../composables/useAlert.ts';

const axiosInstance = axios.create({});

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    if (isExpectedError(response.data)) {
      showAlert(response.data.message, AlertType.Warning);
      return null;
    }

    return response.data;
  },
  (error: AxiosError) => {
    debugger
    return Promise.reject(error);
  }
)

export default axiosInstance;
