import variables from '../utils/variables';
import request from '../utils/request_docker';

export function createContainerFromImage(name, dataString) {
	return request({
		url: '/containers/create?name=' + name,
		method: variables.METHOD_POST,
		data: dataString,
		headers: {
			'Content-Type': variables.Application_Json,
			Accept: variables.Application_Json
		}
	});
}

//---- IMAGES ----
export function getImages() {
	return request({
		url: '/images/json',
		method: variables.METHOD_GET
	});
}

export function inspectImageByID(ID) {
	return request({
		url: '/images/' + ID + '/json',
		method: variables.METHOD_GET
	});
}

export function deleteImageByID(ID) {
	return request({
		url: '/images/' + ID + '?force=true',
		method: variables.METHOD_DELETE
	});
}

export function getAgents() {
	return request({
		url: '/containers/json?all=true',
		method: variables.METHOD_GET
	});
}

export function createAgentDocker(data) {
	return request({
		url: `containers/create?name=${data.ContainerName}`,
		method: variables.METHOD_POST,
		// eslint-disable-next-line
		data: data,
		headers: {
			'Content-Type': variables.Application_Json,
			Accept: variables.Application_Json
		}
	});
}

// eslint-disable-next-line
export function startContainerCreated(ID) {
	return request({
		url: `/containers/${ID}/start`,
		method: variables.METHOD_POST,
		data: {},
		headers: {
			'Content-Type': variables.Application_Json,
			Accept: variables.Application_Json
		}
	});
}

// eslint-disable-next-line
export function stopContainerCreated(ID) {
	return request({
		url: `/containers/${ID}/stop`,
		method: variables.METHOD_POST,
		timeout: 15000,
		data: {},
		headers: {
			'Content-Type': variables.Application_Json,
			Accept: variables.Application_Json
		}
	});
}

export function stopContainerCreatedNew(ID) {
	const requestOptions = {
		method: variables.METHOD_POST,
		redirect: 'follow'
	};

	return fetch(`${variables.local_DOCKER_API}/containers/${ID}/stop`, requestOptions)
		.then(response => response.json())
		.then(responseData => {
			return responseData;
		})
		.catch(error => {
			return error;
		});
}

// eslint-disable-next-line
export function deleteAgentByID(ID) {
	return request({
		url: `/containers/${ID}`,
		method: variables.METHOD_DELETE
	});
}

// eslint-disable-next-line
export function getLogs(ID, since) {
	return request({
		url: `/containers/${ID}/logs?stderr=1&stdout=1&since=${since}`,
		method: variables.METHOD_GET
	});
}

// eslint-disable-next-line
export function inspectAgents(ID) {
	return request({
		url: `/containers/${ID}/json`,
		method: variables.METHOD_GET
	});
}

// TODO: Ver como hacemos esta request
export function getImagesFromExternalDockerRepository() {
	return request({
		url: `/containers/images/json`,
		method: variables.METHOD_GET
	});
}
