import variables from '../utils/variables';
import request from '../utils/orionRequestFactory';

// Level /orion era para el gateway de la UPV

// ---- GET ENTITIES ----
export function entitiesByType(entityType) {
  return request({
    url: `/v2/entities?type=${entityType}`,
    // url: '/orion/v2/entities?type=' + entityType,
    method: variables.METHOD_GET,
    headers: {
      'Fiware-Service': variables.METADATA_HEADER,
    },
  });
}

export function createMetadataEntities(entity) {
  return request({
    url: '/v2/entities?options=upsert',
    // url: '/orion/v2/entities',
    // url: '/v2/entities?options=keyValues',
    method: variables.METHOD_POST,
    data: entity,
    headers: {
      'Content-Type': variables.APPLICATION_JSON,
      Accept: variables.APPLICATION_JSON,
      'Fiware-Service': variables.METADATA_HEADER,
    },
  });
}

export function createSubscription(entity) {
  return request({
    url: '/v2/subscriptions',
    // url: '/orion/v2/subscriptions',
    method: variables.METHOD_POST,
    data: entity,
    headers: {
      'Content-Type': variables.APPLICATION_JSON,
      Accept: variables.APPLICATION_JSON, // ,
      // 'Fiware-Service': variables.Metadata_Header
    },
  });
}

export function deleteEntities(id) {
  return request({
    url: `/v2/entities/${id}`,
    // url: '/orion/v2/entities/' + ID,
    method: variables.METHOD_DELETE,
    headers: {
      Accept: variables.APPLICATION_JSON,
      'Fiware-Service': variables.METADATA_HEADER,
      /*
      'Content-Length': 0
      */
    },
    // No estoy seguro si el header Content-Length es necesario probarlo!!
  });
}

export function deleteSubscriptions(id) {
  return request({
    url: `/v2/subscriptions/${id}`,
    method: variables.METHOD_DELETE,
    /* headers: {
      Accept: variables.Application_Json
      'Fiware-Service': variables.Metadata_Header
    } */
  });
}

export function getSubscriptions() {
  return request({
    url: '/v2/subscriptions',
    method: variables.METHOD_GET,
  });
}

export function checkDatasource(entityType, datasourceId) {
  return request({
    url: `/v2/entities?type=${entityType}&q=refDataSource==${datasourceId}`,
    // url: `/orion/v2/entities?type=${entityType}&q=refDataSource==${datasourceId}`,
    // url: `/v2/entities?type=${entityType}&q=refDataSource==${datasourceId}&options=keyValues`,
    method: variables.METHOD_GET,
  });
}

export function getAgentsAsociated(agentType, dataSourceId) {
  return request({
    url: `/v2/entities?type=${agentType}&q=refDataSource==${dataSourceId}`,
    // url: `/orion/v2/entities?type=${agentType}&q=refDataSource==${dataSourceId}`,
    // url: `/v2/entities?type=${agentType}&q=refDataSource==${dataSourceId}&options=keyValues`,
    method: variables.METHOD_GET,
    headers: {
      'Fiware-Service': variables.METADATA_HEADER,
    },
  });
}
