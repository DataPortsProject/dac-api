import {
	entitiesByType,
	createEntities,
	deleteEntities,
	getSubscriptions,
	checkDatasource,
	getAgentsAsociated
} from '../api/orion';
import CustomError from '../utils/CustomError';

const service = {};

service.getEntitiesByType = getEntitiesByType;
service.createEntity = createEntity;
service.deleteEntity = deleteEntity;
service.getORIONSubscription = getORIONSubscription;
service.checkORIONDatasource = checkORIONDatasource;
service.getORIONAgentsAsociated = getORIONAgentsAsociated;

export default service;

// Implementation
async function getEntitiesByType(type) {
	let orionEntities = [];
	try {
		orionEntities = await entitiesByType(type);
	} catch (error) {
		// properties mapped to ORION errors
		throw new CustomError(error.response.data.description, error.response.status);
	}
	return orionEntities;
}

async function createEntity(entity) {
	let orionEntity = null;
	try {
		orionEntity = await createEntities(entity);
	} catch (error) {
		// properties mapped to ORION errors
		throw new CustomError(error.response.data.description, error.response.status);
	}
	return orionEntity;
}

async function deleteEntity(ID) {
	let orionEntity = null;
	try {
		orionEntity = await deleteEntities(ID);
	} catch (error) {
		// properties mapped to ORION errors
		throw new CustomError(error.response.data.description, error.response.status);
	}
	return orionEntity;
}

async function getORIONSubscription() {
	let orionSubscriptions = [];
	try {
		orionSubscriptions = await getSubscriptions();
	} catch (error) {
		// properties mapped to ORION errors
		throw new CustomError(error.response.data.description, error.response.status);
	}
	return orionSubscriptions;
}

async function checkORIONDatasource(entityType, datasourceId) {
	let data = null;
	try {
		await checkDatasource(entityType, datasourceId).then(response => {
			data = response;
		});
	} catch (error) {
		throw new CustomError(error.response.data, error.response.status);
	}
	return data;
}

async function getORIONAgentsAsociated(agentType, dataSourceId) {
	let data = null;
	try {
		await getAgentsAsociated(agentType, dataSourceId).then(response => {
			data = response;
		});
	} catch (error) {
		throw new CustomError(error.response.data, error.response.status);
	}
	return data;
}
