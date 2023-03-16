import express from 'express';
import logger from '../config/winston';
import { authUser, isAuthorized } from '../middlewares/auth';

import * as infoService from '../services/info.service';
import CustomError from '../utils/CustomError';

import { constructInfoObject } from '../utils/Mapping';

// eslint-disable-next-line import/prefer-default-export
export const router = express.Router();

// required by agents -> no security
router.get('/:id', getOne);
router.delete('/:id', deleteInfo);
// secured routes
router.get('/', authUser, isAuthorized, getAll);
router.post('/', authUser, isAuthorized, create);
router.post('/filtered', authUser, isAuthorized, getFiltered);
router.delete('/container/:id', authUser, isAuthorized, deleteInfoByContainer);

// Implementation
async function getOne(req, res) {
  const { params: { id } = { id: null } } = req;

  try {
    const data = await infoService.getOne(id);
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

async function getAll(req, res) {
  const { query } = req;

  try {
    const data = await infoService.getAll(query);
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

async function deleteInfo(req, res) {
  const { params: { id } = { id: null } } = req;

  try {
    const data = await infoService.deleteInfo(id);
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

async function deleteInfoByContainer(req, res) {
  const { params: { id } = { id: null } } = req;

  try {
    logger.debug(`DELETE INFO BY CONTAINER ${id}`);

    const data = await infoService.deleteInfoByContainer(id);
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

async function getFiltered(req, res) {
  try {
    const id = req.body.random_id;
    const interval = req.body.time_interval;
    const unit = req.body.time_unit;

    const data = await infoService.getFiltered(id, interval, unit);
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

async function create(req, res) {
  const query = constructInfoObject(req.body);

  try {
    const data = await infoService.create(query);
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
