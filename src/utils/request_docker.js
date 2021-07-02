import axios from 'axios';
import variables from './variables';

// create an axios instance
const service = axios.create({
	baseURL: variables.local_DOCKER_API,
	timeout: 5000 // request timeout
});

// request interceptor
service.interceptors.request.use(
	config => {
		// do something before request is sent
		return config;
	},
	error => {
		// do something with request error
		return Promise.reject(error);
	}
);

// response interceptor
service.interceptors.response.use(
	response => {
		// const res = JSON.stringify(response.data, null, 4)
		const res = response.data;
		return res;
	},
	error => {
		return Promise.reject(error);
	}
);

export default service;
