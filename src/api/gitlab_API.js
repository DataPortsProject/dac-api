import variables from '../utils/variables';
import request from '../utils/gitlabRequestFactory';

// ---- PROJECTS ----
export function getProjects() {
  return request({
    url: '/api/v4/projects?order_by=id&sort=asc',
    method: variables.METHOD_GET,
    headers: {
      'PRIVATE-TOKEN': variables.gitlab_token,
    },
  });
}

export function getJson(newURL) {
  return request({
    url: newURL,
    method: variables.METHOD_GET,
    headers: {
      'PRIVATE-TOKEN': variables.gitlab_token,
    },
  });
}

export function getRepositoryImages(body) {
  return request({
    baseURL: body.url,
    url: `/api/v4/projects/${body.projectId}/registry/repositories`,
    method: variables.METHOD_GET,
    headers: {
      'PRIVATE-TOKEN': body.accessToken,
    },
  });
}

export function downloadImage(path) {
  const urlRequest = `/api/v4/projects/25/repository/files/${path}/raw?ref=master`;
  return request({
    url: urlRequest,
    timeout: 30000,
    method: variables.METHOD_GET,
    headers: {
      'PRIVATE-TOKEN': variables.gitlab_token,
    },
  });
}
