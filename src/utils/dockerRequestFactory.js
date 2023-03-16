import axios from 'axios';
import variables from './variables';
import logger from '../config/winston';

// create an axios instance
const dockerRequestFactory = axios.create({
  baseURL: variables.LOCAL_DOCKER_API,
  timeout: 15000, // request timeout
});

// request interceptor
dockerRequestFactory.interceptors.request.use(
  (config) => {
    // do something before request is sent
    logger.debug(JSON.stringify(config));
    return config;
  },
  (error) =>
    // do something with request error
    Promise.reject(error)
);

// response interceptor
dockerRequestFactory.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

export default dockerRequestFactory;
