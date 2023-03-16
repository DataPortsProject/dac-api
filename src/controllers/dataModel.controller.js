import express from 'express';
import { authUser, isAuthorized } from '../middlewares/auth';
import logger from '../config/winston';
import * as dataModelService from '../services/dataModel.service';
import CustomError from '../utils/CustomError';

// eslint-disable-next-line
import { constructDataModelObj, updateDataModelObj } from '../utils/Mapping';

// eslint-disable-next-line import/prefer-default-export
export const router = express.Router();

// routes
router.get('/', authUser, isAuthorized, getAll);
router.post('/', authUser, isAuthorized, createDataModelAssigment);
router.delete('/:id', authUser, isAuthorized, deleteDataModel);
router.put('/:id', authUser, isAuthorized, updateDataModel);
router.post('/getSchema', getJsonSchema);

// Implementación
async function getAll(_req, res) {
  try {
    const data = await dataModelService.getAll();
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
      message: 'An error ocurred',
    });
  }
}

async function createDataModelAssigment(req, res) {
  const dataModel = constructDataModelObj(req.body);

  try {
    const data = await dataModelService.createDataModelAssigment(dataModel);
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

async function deleteDataModel(req, res) {
  const { params: { id } = { id: null } } = req;

  try {
    const data = dataModelService.deleteDataModel(id);
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
      message: 'An error ocurred',
    });
  }
}

async function updateDataModel(req, res) {
  logger.debug('UPDATE DATA MODEL');
  const { params: { id } = { id: null } } = req;
  const dataModel = updateDataModelObj(req.body);

  try {
    const data = dataModelService.updateDataModel(id, dataModel);
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

async function getJsonSchema(req, res) {
  const properties = req.body;

  try {
    const data = await dataModelService.getJsonSchema(properties);
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
