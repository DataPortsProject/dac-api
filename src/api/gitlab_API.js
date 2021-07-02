import variables from '../utils/variables';
import request from '../utils/request_gitlab';

// ---- PROJECTS ----
export function getProjects() {
	return request({
		url: '/api/v4/projects',
		method: variables.METHOD_GET,
		headers: {
			'PRIVATE-TOKEN': variables.gitlab_token
		}
	});
}

export function getJson(newURL) {
	return request({
		url: newURL,
		method: variables.METHOD_GET,
		headers: {
			'PRIVATE-TOKEN': variables.gitlab_token
		}
	});
}

export function getRepositoryImages() {
	return request({
		url: '/api/v4/projects/25/repository/tree?path=agent_images',
		method: variables.METHOD_GET,
		headers: {
			'PRIVATE-TOKEN': variables.gitlab_token
		}
	});
}

export function downloadImage(path) {
	const urlRequest = `/api/v4/projects/25/repository/files/${path}/raw?ref=master`;
	return request({
		url: urlRequest,
		timeout: 30000,
		method: variables.METHOD_GET,
		headers: {
			'PRIVATE-TOKEN': variables.gitlab_token
		}
	});
}
