import axios from 'axios';
import variables from './variables';
import logger from '../config/winston';

// create an axios instance
const orionRequestFactory = axios.create({
  baseURL: variables.URL_ORION_UPV,
  timeout: 15000, // request timeout
});

// request interceptor
orionRequestFactory.interceptors.request.use(
  (config) => {
    // do something before request is sent
    logger.debug(JSON.stringify(config));
    return config;
  },
  (error) => Promise.reject(error)
);

// response interceptor
orionRequestFactory.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

export default orionRequestFactory;
