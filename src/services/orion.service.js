import {
	entitiesByType,
	createEntities,
	deleteEntities,
	getSubscriptions,
	checkDatasource,
	getAgentsAsociated,
	createSubscription,
	deleteSubscriptions
} from '../api/orion';
import CustomError from '../utils/CustomError';

const service = {};

service.getEntitiesByType = getEntitiesByType;
service.createEntity = createEntity;
service.deleteEntity = deleteEntity;
service.getORIONSubscription = getORIONSubscription;
service.checkORIONDatasource = checkORIONDatasource;
service.getORIONAgentsAsociated = getORIONAgentsAsociated;
service.createSubscriptions = createSubscriptions;
service.deleteSubscription = deleteSubscription;

export default service;

// Implementation
async function getEntitiesByType(type) {
	let orionEntities = [];
	try {
		orionEntities = await entitiesByType(type);
	} catch (error) {
		// properties mapped to ORION errors
		// throw new CustomError(error.response.data.description, error.response.status);
		throw new CustomError(error.response.data.orionError.details, error.response.data.orionError.code);
	}
	return orionEntities;
}

async function createEntity(entity) {
	let orionEntity = null;
	try {
		orionEntity = await createEntities(entity);
	} catch (error) {
		// properties mapped to ORION errors
		// throw new CustomError(error.response.data.description, error.response.status);
		throw new CustomError(error.response.data.orionError.details, error.response.data.orionError.code);
	}
	return orionEntity;
}

async function createSubscriptions(entity) {
	let orionEntity = null;

	try {
		// orionEntity = await createSubscription(entity);
		// console.log(orionEntity);
		await createSubscription(JSON.stringify(entity)).then(response => {
			console.log(response);
			orionEntity = response;
		}) 
	} catch (error) {
		// properties mapped to ORION errors
		// throw new CustomError(error.response.data.description, error.response.status);
		throw new CustomError(error.response.data.orionError.details, error.response.data.orionError.code);
	}
	return orionEntity;
}

async function deleteEntity(ID) {
	let orionEntity = null;
	try {
		orionEntity = await deleteEntities(ID);
	} catch (error) {
		// properties mapped to ORION errors
		// throw new CustomError(error.response.data.description, error.response.status);
		throw new CustomError(error.response.data.orionError.details, error.response.data.orionError.code);
	}
	return orionEntity;
}

async function deleteSubscription(ID) {
	let subscriptionEntity = null;
	try {
		subscriptionEntity = await deleteSubscriptions(ID);
	} catch (error) {
		throw new CustomError(error.response.data.orionError.details, error.response.data.orionError.code);
	}
	return subscriptionEntity;
}

async function getORIONSubscription() {
	let orionSubscriptions = [];
	try {
		orionSubscriptions = await getSubscriptions();
	} catch (error) {
		// properties mapped to ORION errors
		// throw new CustomError(error.response.data.description, error.response.status);
		throw new CustomError(error.response.data.orionError.details, error.response.data.orionError.code);
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
		// throw new CustomError(error.response.data, error.response.status);
		throw new CustomError(error.response.data.orionError.details, error.response.data.orionError.code);
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
		// throw new CustomError(error.response.data, error.response.status);
		throw new CustomError(error.response.data.orionError.details, error.response.data.orionError.code);
	}
	return data;
}
