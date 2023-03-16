import express from 'express';
import logger from '../config/winston';
import { authUser, isAuthorized } from '../middlewares/auth';

import * as notificationService from '../services/notification.service';
import CustomError from '../utils/CustomError';

import { constructNotification } from '../utils/Mapping';

import variables from '../utils/variables';
import * as agentService from '../services/agents.service';
import { WsSocket } from '../utils/wsSocket';

const webSocket = new WsSocket(3010);

// eslint-disable-next-line import/prefer-default-export
export const router = express.Router();

// secured routes
router.get('/:id', authUser, isAuthorized, getOne);
router.get('/', authUser, isAuthorized, getAll);
router.delete('/:id', authUser, isAuthorized, deleteNotification);
// required by agents
router.post('/', create);
router.patch('/manageOnDemandContainers/:id', manageOnDemandContainers);

// Implementation
async function getOne(req, res) {
  const { params: { id } = { id: null } } = req;

  try {
    const data = await notificationService.getOne(id);
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
  const { limit, offset, ...query } = req.query;

  try {
    const { count, data } = await notificationService.getAll(
      query,
      limit,
      offset
    );
    return res.set('x-total-count', count).status(200).json({
      status: 'OK',
      message: data,
      total: count,
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

async function deleteNotification(req, res) {
  const { params: { id } = { id: null } } = req;
  const query = req.body;

  try {
    const data = await notificationService.deleteNotification(id, query);
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
  const query = constructNotification(req.body);

  try {
    const data = await notificationService.create(query);

    const message = `${data.id},${data.type},${data.message}`;
    webSocket.broadcast(message);
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

async function manageOnDemandContainers(req, res) {
  const { params: { id } = { id: null } } = req;

  if (!id) {
    return res.status(variables.INTERNAL_SERVER_ERROR).json({
      status: 'Validation',
      message: 'Malformed url',
    });
  }

  try {
    await agentService.stopAgent(id);

    await agentService.deleteAgent(id);

    const notificationData = {
      id,
      type: 'SUCCESS',
      message: 'On-Demand Agent removed',
      register: '',
    };

    const query = constructNotification(notificationData);

    const dataNotification = await notificationService.create(query);

    const message = `${dataNotification.id},${dataNotification.type},${dataNotification.message}`;
    webSocket.broadcast(message);
    return res.status(200).json({
      status: 'OK',
      message: dataNotification,
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
