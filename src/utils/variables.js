export default {
	// para despliegues (Windows)
	// local_DOCKER_API: 'http://host.docker.internal:2375',
	// para despliegues (Linux)
	// local_DOCKER_API: 'http://172.17.0.1:2375',
	// para desarrollo en local
	local_DOCKER_API: 'http://localhost:2375',
	// URL Orion UPV
	baseURL_ORION_UPV: 'http://158.42.188.129:8080',
	baseURL_ORION_LOCAL: 'http://localhost:1026',
	// image pattern name
	IMAGE_PATTERN_NAME: 'dataportsh2020/',
	// methods petition API
	METHOD_GET: 'GET',
	METHOD_POST: 'POST',
	METHOD_PUT: 'PUT',
	METHOD_DELETE: 'DELETE',
	// attributes for petitions
	Application_Json: 'application/json',
	Metadata_Header: 'metadata',
	// HTTP STATUS CODE
	INTERNAL_SERVER_ERROR: 500,
	CORRECT_REQUEST: 200,
	NOT_FOUND: 404,
	// ENV VARIABLES NOT INCLUDED
	ENV_VARIABLES_NOT_ALLOWED: [
		'PATH',
		'LANG',
		'GPG_KEY',
		'PYTHON_VERSION',
		'PYTHON_PIP_VERSION',
		'PYTHON_GET_PIP_URL',
		'PYTHON_GET_PIP_SHA256'
	],
	gitlab_url: 'http://egitlab.iti.upv.es',
	gitlab_token: 'D3-5YV3H1Zk7heVsnzX7'
};