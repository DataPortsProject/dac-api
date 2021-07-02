import CustomError from '../utils/CustomError';
import { constructAgentsObj, constructInspectAgentObj } from '../utils/Mapping';

/* eslint-disable */
import {
	getAgents,
	createAgentDocker,
	startContainerCreated,
	stopContainerCreated,
	getLogs,
	inspectAgents,
	deleteAgentByID
} from '../api/docker_API';

const service = {};

service.ngsiagent = ngsiagent;
service.createAgent = createAgent;
service.startAgent = startAgent;
service.stopAgent = stopAgent;
service.getLog = getLog;
service.inspectAgent = inspectAgent;
service.deleteAgent = deleteAgent;

export default service;

// Lista todos los agentes
async function ngsiagent() {
	let data = [];
	try {
		await getAgents().then(response => {
			const agentsData = response;
			data = constructAgentsObj(agentsData);
		});
	} catch (error) {
		throw new CustomError(error.response.data, error.response.status);
	}
	return data;
}

// Crea un agente y lo arranca
async function createAgent(model) {
	let containerData = null;
	let data = null;
	try {
		await createAgentDocker(model).then(response => {
			containerData = response;
			data = startAgent(containerData.Id);
		});
	} catch (error) {
		throw new CustomError(error.response.data, error.response.status);
	}
	return data;
}

async function startAgent(ID) {
	let data = null;

	try {
		await startContainerCreated(ID).then(() => {
			data = ID;
		});
	} catch (error) {
		throw new CustomError(error.response.data, error.response.status);
	}
	return data;
}

async function stopAgent(ID) {
	let data = null;

	try {
		await stopContainerCreated(ID).then(() => {
			data = ID;
		});
	} catch (error) {
		throw new CustomError(error.response.data, error.response.status);
	}
	return data;
}

async function deleteAgent(ID) {
	let data = [];
	try {
		await deleteAgentByID(ID).then(() => {
			data = ID;
		});
	} catch (error) {
		throw new CustomError(error.response.data, error.response.status);
	}
	return data;
}

async function getLog(ID, since) {
	let data = null;
	try {
		await getLogs(ID, since).then(response => {
			data = response;
		});
	} catch (error) {
		throw new CustomError(error.response.data, error.response.status);
	}
	return data;
}

async function inspectAgent(ID) {
	let data = null;
	try {
		await inspectAgents(ID).then(response => {
			data = constructInspectAgentObj(response);
		});
	} catch (error) {
		throw new CustomError(error.response.data, error.response.status);
	}
	return data;
}
