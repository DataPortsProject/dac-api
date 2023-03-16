import {
  entitiesByType,
  createMetadataEntities,
  deleteEntities,
  getSubscriptions,
  checkDatasource,
  getAgentsAsociated,
  createSubscription,
  deleteSubscriptions,
} from '../api/orion';
import CustomError from '../utils/CustomError';
import logger from '../config/winston';

// Implementation
export async function getEntitiesByType(type) {
  try {
    return await entitiesByType(type);
  } catch (error) {
    // properties mapped to ORION errors
    // throw new CustomError(error.response.data.description, error.response.status);
    throw new CustomError(
      error.response.data.orionError.details,
      error.response.data.orionError.code
    );
  }
}

export async function createEntity(entity) {
  try {
    logger.debug(`Creating metadata for agent: ${JSON.stringify(entity)}`);
    return await createMetadataEntities(entity);
  } catch (error) {
    if (error.isAxiosError) {
      logger.error(JSON.stringify(error.response));
    } else {
      logger.error(error);
    }
    // properties mapped to ORION errors
    // throw new CustomError(error.response.data.description, error.response.status);
    throw new CustomError(
      error.response.data.orionError.details,
      error.response.data.orionError.code
    );
  }
}

export async function createSubscriptions(entity) {
  try {
    return await createSubscription(JSON.stringify(entity));
  } catch (error) {
    // properties mapped to ORION errors
    // throw new CustomError(error.response.data.description, error.response.status);
    throw new CustomError(
      error.response.data.orionError.details,
      error.response.data.orionError.code
    );
  }
}

export async function deleteEntity(id) {
  try {
    return await deleteEntities(id);
  } catch (error) {
    // properties mapped to ORION errors
    throw new CustomError(
      error.response.data.description,
      error.response.status
    );
  }
}

export async function deleteSubscription(id) {
  try {
    return await deleteSubscriptions(id);
  } catch (error) {
    throw new CustomError(
      error.response.data.orionError.details,
      error.response.data.orionError.code
    );
  }
}

export async function getORIONSubscription() {
  try {
    return await getSubscriptions();
  } catch (error) {
    // properties mapped to ORION errors
    logger.error(error.toString());
    throw new CustomError(
      error.response.data.orionError.details,
      error.response.data.orionError.code
    );
  }
}

export async function checkORIONDatasource(entityType, datasourceId) {
  try {
    return await checkDatasource(entityType, datasourceId);
  } catch (error) {
    throw new CustomError(
      error.response.data.orionError.details,
      error.response.data.orionError.code
    );
  }
}

export async function getORIONAgentsAsociated(agentType, dataSourceId) {
  try {
    return await getAgentsAsociated(agentType, dataSourceId);
  } catch (error) {
    throw new CustomError(
      error.response.data.orionError.details,
      error.response.data.orionError.code
    );
  }
}
