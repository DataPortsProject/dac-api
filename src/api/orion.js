import variables from '../utils/variables';
import request from '../utils/request_ORION';

//---- GET ENTITIES ----
export function entitiesByType(entityType) {
	return request({
		url: '/v2/entities?type=' + entityType,
		method: variables.METHOD_GET,
		headers: {
			'Fiware-Service': variables.Metadata_Header
		}
	});
}

export function createEntities(entity) {
	return request({
		url: '/v2/entities?options=keyValues',
		method: variables.METHOD_POST,
		data: entity,
		headers: {
			'Content-Type': variables.Application_Json,
			Accept: variables.Application_Json,
			'Fiware-Service': variables.Metadata_Header
		}
	});
}

export function deleteEntities(ID) {
	return request({
		url: '/v2/entities/' + ID,
		method: variables.METHOD_DELETE,
		headers: {
			Accept: variables.Application_Json,
			'Fiware-Service': variables.Metadata_Header
			/*
			'Content-Length': 0
			*/
		}
		// No estoy seguro si el header Content-Length es necesario probarlo!!
	});
}

export function getSubscriptions() {
	return request({
		url: '/v2/subscriptions',
		method: variables.METHOD_GET
	});
}

export function checkDatasource(entityType, datasourceId) {
	return request({
		url: `/v2/entities?type=${entityType}&q=refDataSource==${datasourceId}&options=keyValues`,
		method: variables.METHOD_GET
	});
}

export function getAgentsAsociated(agentType, dataSourceId) {
	return request({
		url: `/v2/entities?type=${agentType}&q=refDataSource==${dataSourceId}&options=keyValues`,
		method: variables.METHOD_GET,
		headers: {
			'Fiware-Service': variables.Metadata_Header
		}
	});
}
