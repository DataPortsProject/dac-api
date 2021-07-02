// import OnDemand from '../models/OnDemand.model';
// import HttpRequester from '../middlewares/httpRequests';
import axios from 'axios';
import variables from '../config/variables';

const service = {};

service.getTemplate = getTemplate;
service.createContainer = createContainer;
service.stopContainer = stopContainer;
service.startContainer = startContainer;
export default service;

// Implementation
async function getTemplate() {
	let template = null;
	try {
		// TODO: Este template cuando esté definido igual debería estar en una clase en models
		template = {
			env: ['env1=val', 'env2=val'],
			image: 'image_name',
			tag: 'latest',
			containername: 'container_name'
		};
	} catch (error) {
		throw new Error(error);
	}
	return template;
}

async function createContainer(query) {
	let data = {};
	const controller = `${variables.DOCKER_HOST}/containers/create?name=${query.containername}`;
	const params = constructDockerJson(query);

	await axios({
		method: 'post',
		url: controller,
		data: params
	}).then(
		response => {
			data = response.data;
			startContainer(data);
		},
		error => {
			data.message = error.response.data.message;
		}
	);
	data.containerName = query.containername;
	return data;
}

async function stopContainer(query) {
	let data = {};
	const controller = `${variables.DOCKER_HOST}/containers/${query.Id}/stop`;
	const params = {};

	await axios({
		method: 'post',
		url: controller,
		data: params
	}).then(
		() => {
			data = `Container ${query.Id} stopped successfully!`;
		},
		error => {
			data.name = error.name;
			data.message = error.message;
		}
	);

	return data;
}

async function startContainer(query) {
	let data = {};
	const controller = `${variables.DOCKER_HOST}/containers/${query.Id}/start`;
	const params = {};

	await axios({
		method: 'post',
		url: controller,
		data: params
	}).then(
		() => {
			data = `Container ${query.Id} started successfully!`;
		},
		error => {
			data.name = error.name;
			data.message = error.message;
		}
	);

	return data;
}

// Funcion para crear un objeto valido para la creación de un contenedor en la api de docker
function constructDockerJson(data) {
	// TODO: Este objeto a enviar a docker igual debería ser una clase en models
	const dockerObject = {
		image: data.image,
		tag: data.tag ? data.tag : 'latest',
		env: []
	};

	data.env.forEach(env => {
		dockerObject.env.push(env);
	});

	return dockerObject;
}
