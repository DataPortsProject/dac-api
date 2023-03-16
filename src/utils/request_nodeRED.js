import axios from 'axios';
import { Agent } from 'https';
import logger from '../config/winston';
import variables from './variables';

const httpsAgent = Agent({
  rejectUnauthorized: false,
});

// create an axios instance
const service = axios.create({
  baseURL: variables.URL_DAC_NOTIFY,
  timeout: 15000, // request timeout
  httpsAgent,
});

// request interceptor
service.interceptors.request.use(
  (config) => config,
  (error) => {
    logger.error(error);
    return Promise.reject(error);
  }
);

// response interceptor
service.interceptors.response.use(
  (response) => {
    const res = response.data;
    return res;
  },
  (error) => {
    if (error.isAxiosError) {
      logger.error(JSON.stringify(error.response));
    } else {
      logger.error(error);
    }
    return Promise.reject(error);
  }
);

export default service;
