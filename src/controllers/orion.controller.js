import express from 'express';
import logger from '../config/winston';
import * as orionService from '../services/orion.service';

import CustomError from '../utils/CustomError';

// eslint-disable-next-line import/prefer-default-export
export const router = express.Router();

// routes
router.get('/:type/entitiesByType', getEntitiesByType);
router.get('/getSubscriptions', getSubscriptions);
router.get('/checkDatasource', checkDatasource);
router.get('/getAgentsAsociated', getAgentsAsociated);
router.post('/createEntity', createEntity);
router.delete('/:id', deleteEntity);
router.post('/createSubscriptions', createSubscriptions);
router.delete('/subscription/:id', deleteSubscription);

// Implementation
async function getEntitiesByType(req, res) {
  const { params: { type } = { type: null } } = req;
  try {
    const data = await orionService.getEntitiesByType(type);
    return res.status(200).json({
      status: 'OK',
      message: data,
    });
  } catch (error) {
    logger.error(error.toString());
    if (error instanceof CustomError) {
      const { message, name, typeCode } = error;
      // message --> error reported by Docker's API
      // name --> name of the class (always will be 'Error')
      // stack --> where the error is located?
      // type --> HttpStatusCode reported by Docker's API
      return res.status(typeCode).json({
        status: name,
        message: message.message,
      });
    }
    return res.status(404).json({
      status: 'Error',
      message: 'An error occurred',
    });
  }
}

async function createEntity(req, res) {
  const entity = req.body;

  try {
    const data = await orionService.createEntity(entity);
    return res.status(200).json({
      status: 'OK',
      message: data,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      // eslint-disable-next-line
      const { message, name, type } = error;
      return res.status(type).json({
        status: name,
        message: message.message,
      });
    }
    return res.status(404).json({
      error: {
        status: 'Error',
        message: 'An error occurred',
      },
    });
  }
}

async function createSubscriptions(req, res) {
  const entity = req.body;

  try {
    const data = await orionService.createSubscriptions(entity);

    return res.status(200).json({
      status: 'OK',
      message: data,
    });
  } catch (error) {
    logger.error(error.toString());
    if (error instanceof CustomError) {
      // eslint-disable-next-line
      const { message, name, type } = error;
      return res.status(type).json({
        status: name,
        message: message.message,
      });
    }
    return res.status(404).json({
      error: {
        status: 'Error',
        message: 'An error occurred',
      },
    });
  }
}

async function deleteEntity(req, res) {
  const { params: { id } = { id: null } } = req;

  try {
    const data = await orionService.deleteEntity(id);
    return res.status(200).json({
      status: 'OK',
      message: data,
    });
  } catch (error) {
    logger.error(error.toString());
    if (error instanceof CustomError) {
      // eslint-disable-next-line
      const { message, name, type } = error;
      return res.status(type).json({
        status: name,
        message: message.message,
      });
    }
    return res.status(404).json({
      error: {
        status: 'Error',
        message: 'An error occurred',
      },
    });
  }
}

async function deleteSubscription(req, res) {
  const { params: { id } = { id: null } } = req;

  try {
    const data = await orionService.deleteSubscription(id);
    return res.status(200).json({
      status: 'OK',
      message: data,
    });
  } catch (error) {
    logger.error(error.toString());
    if (error instanceof CustomError) {
      // eslint-disable-next-line
      const { message, name, type } = error;
      return res.status(type).json({
        status: name,
        message: message.message,
      });
    }
    return res.status(404).json({
      error: {
        status: 'Error',
        message: 'An error occurred',
      },
    });
  }
}

async function getSubscriptions(_req, res) {
  try {
    const data = await orionService.getORIONSubscription();
    return res.status(200).json({
      status: 'OK',
      message: data,
    });
  } catch (error) {
    logger.error(error.toString());
    if (error instanceof CustomError) {
      const { message, name, type } = error;

      return res.status(type).json({
        status: name,
        message: message.message,
      });
    }
    return res.status(404).json({
      status: 'Error',
      message: 'An error occurred',
    });
  }
}

async function checkDatasource(req, res) {
  const { query: { entityType } = { entityType: null } } = req;
  const { query: { datasourceId } = { datasourceId: null } } = req;

  try {
    const data = await orionService.checkORIONDatasource(
      entityType,
      datasourceId
    );
    return res.status(200).json({
      status: 'OK',
      message: data,
    });
  } catch (error) {
    logger.error(error.toString());
    if (error instanceof CustomError) {
      const { message, name, type } = error;

      return res.status(type).json({
        status: name,
        message: message.message,
      });
    }
    return res.status(404).json({
      status: 'Error',
      message: 'An error occurred',
    });
  }
}

async function getAgentsAsociated(req, res) {
  const { query: { agentType } = { agentType: null } } = req;
  const { query: { dataSourceId } = { dataSourceId: null } } = req;

  try {
    const data = await orionService.getORIONAgentsAsociated(
      agentType,
      dataSourceId
    );
    return res.status(200).json({
      status: 'OK',
      message: data,
    });
  } catch (error) {
    logger.error(error.toString());
    if (error instanceof CustomError) {
      const { message, name, type } = error;

      return res.status(type).json({
        status: name,
        message: message.message,
      });
    }
    return res.status(404).json({
      status: 'Error',
      message: 'An error occurred',
    });
  }
}
