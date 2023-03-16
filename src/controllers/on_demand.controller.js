import express from 'express';
import logger from '../config/winston';
import { createContainer } from '../services/on_demand.service';

import * as agentService from '../services/agents.service';
import * as infoService from '../services/info.service';

import { requestContainerObj, responseContainerObject } from '../utils/Mapping';
import CustomError from '../utils/CustomError';

// eslint-disable-next-line import/prefer-default-export
export const router = express.Router();

// routes
router.post('/createContainer', createNewContainer);
router.post('/', createOnDemandContainer);

async function createOnDemandContainer(req, res) {
  const query = requestContainerObj(req.body);
  logger.debug(`Receiver query ${JSON.stringify(query)}`);

  try {
    const { name } = req.body;
    const { image } = req.body;

    // Hacemos el getTemplate para obtener el random_id
    const template = await agentService.getTemplate(image);
    let randomId = '';
    template.environment.forEach((env) => {
      if (env.key === 'RANDOM_ID') {
        randomId = env.value;
      }
    });

    // Hacemos una insercion en mongo
    const mongoObj = {
      random_id: randomId,
      container_name: name,
    };

    await infoService.create(mongoObj);

    // Creamos el contenedor
    const data = await createContainer(name, query);

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

async function createNewContainer(req, res) {
  const query = requestContainerObj(req.body);

  try {
    const { name } = req.body;
    const container = await createContainer(name, query);
    const data = responseContainerObject(container);

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
