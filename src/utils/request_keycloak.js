import axios from 'axios';
import variables from './variables';

// create an axios instance
const service = axios.create({
  baseURL: variables.KEYCLOAK_URL,
  timeout: 15000, // request timeout
});

// request interceptor
service.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// response interceptor
service.interceptors.response.use(
  (response) => {
    // const res = JSON.stringify(response.data, null, 4)
    const res = response.data;
    return res;
  },
  (error) => Promise.reject(error)
);

export default service;
