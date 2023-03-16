import axios from 'axios';
import variables from './variables';

import logger from '../config/winston';

// create an axios instance
const service = axios.create({
  baseURL: variables.URL_CYGNUS,
  timeout: 15000, // request timeout
});

// request interceptor
service.interceptors.request.use(
  (config) => config,
  (error) => {
    // do something with request error
    logger.error(error.toString());
    if (error.isAxiosError) {
      logger.debug(error.toJSON());
    }
    return Promise.reject(error);
  }
);

// response interceptor
service.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // do something with request error
    logger.error(error.toString());
    if (error.isAxiosError) {
      logger.debug(error.toJSON());
    } else {
      logger.debug(JSON.stringify(error));
    }
    return Promise.reject(error);
  }
);

export default service;
