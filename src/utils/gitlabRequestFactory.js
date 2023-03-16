import axios from 'axios';
import variables from './variables';

// create an axios instance
const gitlabRequestFactory = axios.create({
  baseURL: variables.gitlab_url,
  timeout: 30000, // request timeout
});

// request interceptor
gitlabRequestFactory.interceptors.request.use(
  (config) =>
    // do something before request is sent
    config,
  (error) =>
    // do something with request error
    Promise.reject(error)
);

// response interceptor
gitlabRequestFactory.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

export default gitlabRequestFactory;
