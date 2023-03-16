import express from 'express';
import logger from '../config/winston';
import * as agentsService from '../services/agents.service';
import imageSrv from '../services/images.service';
import * as orionSrv from '../services/orion.service';
import * as infoService from '../services/info.service';

import variables from '../utils/variables';
import CustomError from '../utils/CustomError';

// eslint-disable-next-line
import { constructAgentTemplate, constructInfoObject } from '../utils/Mapping';

// eslint-disable-next-line import/prefer-default-export
export const router = express.Router();

// routes
router.get('/ngsiagent', ngsiagent);
router.post('/ngsiagent/template', getTemplate);
router.post('/ngsiagent', createAgent);
router.patch('/ngsiagent/:id/start', startAgent);
router.patch('/ngsiagent/:id/stop', stopAgent);
router.get('/ngsiagent/:id/log', getLog);
router.get('/ngsiagent/:id/inspect', inspectAgent);
router.delete('/ngsiagent/:id', deleteAgent);

// SW GET para listar todos los agentes
async function ngsiagent(_req, res) {
  try {
    const agents = await agentsService.getAllAgents();
    return res.status(200).json({
      status: 'OK',
      message: agents,
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

async function getTemplate(req, res) {
  const agentName = req.body.containerName;

  try {
    const data = await agentsService.getTemplate(agentName);
    return res.status(200).json({
      status: 'OK',
      message: data,
    });
  } catch (error) {
    logger.error(error.toString());
    if (error instanceof CustomError) {
      const { message, name, type, stack } = error;
      // message --> error reported by Docker's API
      // name --> name of the class (always will be 'Error')
      // stack --> where the error is located?
      // type --> HttpStatusCode reported by Docker's API
      return res.status(type).json({
        status: name,
        message: message.message,
        stack,
      });
    }
    return res.status(404).json({
      status: 'Error',
      message: 'An error occurred',
    });
  }
}

/**
 * Helper function to create an agent given
 * @param {*} req
 * @param {*} res
 * @returns
 */
async function createAgent(req, res) {
  const model = constructAgentTemplate(req.body);
  if (!model.Image) {
    return res.status(variables.NOT_FOUND).json({
      status: 'Validation',
      message: 'You must specify a valid image tag',
    });
  }

  try {
    const containerInfo = await agentsService.createAgent(model);

    try {
      // The following steps should be fault-tolerant

      // obtain associated datasource from imagesService.getDataSource(id)
      const datasource = await imageSrv.getDataSource(model.Image);
      // build entity of type 'DataSource'
      const dataSourceEntity = JSON.parse(datasource.dataSource);
      // push DataSource entity to Orion
      await orionSrv.createEntity(dataSourceEntity);
      // build entity of type 'AgentContainer'
      const agentContainerEntity = buildAgentContainerEntity(
        containerInfo.Id,
        datasource
      );

      await orionSrv.createEntity(agentContainerEntity);
      // find image template
      const imgTemplate = await imageSrv.getTemplate(model.Image);
      // Create info model
      const infoModel = {
        random_id: (
          imgTemplate.environment.filter(
            (item) => item.key === 'RANDOM_ID'
          )[0] || { value: '' }
        ).value,
        container_name: model.ContainerName,
        // time_interval comes as an env variable in the form TIME_INTERVAL=5
        time_interval: Number(
          (
            model.Env.filter((item) => item.startsWith('TIME_INTERVAL'))[0] ||
            '0=0'
          ).split('=')[1]
        ),
        time_units: (
          model.Env.filter((item) => item.startsWith('TIME_INTERVAL'))[0] || '='
        ).split('=')[1],
      };
      await infoService.create(constructInfoObject(infoModel));
    } catch (ex) {
      logger.warn(
        'There were problems creating metadata. See stacktraces for mor info'
      );
      logger.error(ex);
    }

    return res.status(200).json({
      status: 'OK',
      message: containerInfo,
    });
  } catch (error) {
    logger.error(JSON.stringify(error));
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

// SW PATCH para crear y arrancar un agente
async function startAgent(req, res) {
  const { params: { id } = { id: null } } = req;

  if (!id) {
    return res.status(variables.INTERNAL_SERVER_ERROR).json({
      status: 'Validation',
      message: 'Malformed url',
    });
  }

  try {
    const data = await agentsService.startAgent(id);
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

// SW PATCH para parar un agente que esté corriendo
async function stopAgent(req, res) {
  const { params: { id } = { id: null } } = req;

  if (!id) {
    return res.status(variables.INTERNAL_SERVER_ERROR).json({
      status: 'Validation',
      message: 'Malformed url',
    });
  }

  try {
    const data = await agentsService.stopAgent(id);
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

// SW Para borrar un agente
async function deleteAgent(req, res) {
  const { params: { id } = { id: null } } = req;

  try {
    const agentInfo = await agentsService.inspectAgent(id);
    // delete docker container
    const data = await agentsService.deleteAgent(id); // data contains the deleted agent id
    try {
      // remove the AgentContainer entity in the metadata database
      await orionSrv.deleteEntity(`urn:ngsi-ld:AgentContainer:${id}`);
      // remove the info document in dataports-db
      await infoService.deleteInfoByContainer(agentInfo.name);
    } catch (ex) {
      // these two instructions should not invalidate the whole request
      logger.warn(
        'Could not delete metadata associated to agent. Checks stacktraces for mor info'
      );
      logger.error(ex);
    }

    return res.status(200).json({
      status: 'OK',
      message: data,
    });
  } catch (error) {
    logger.error(error.toString());
    if (error instanceof CustomError) {
      // eslint-disable-next-line
      const { message, name, type } = error;
      return res.status(type || 500).json({
        status: name,
        message,
      });
    }

    return res.status(404).json({
      status: 'Error',
      message: 'An error occurred',
    });
  }
}

// SW GET para listar todos los agentes
async function getLog(req, res) {
  const { params: { id } = { id: null } } = req;
  const { query: { since } = { since: '' } } = req;

  try {
    const data = await agentsService.getLog(id, since);
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

// SW GET para inspeccionar un agente
async function inspectAgent(req, res) {
  const { params: { id } = { id: null } } = req;
  try {
    const data = await agentsService.inspectAgent(id);
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

function buildAgentContainerEntity(containerId, datasource) {
  return {
    id: `urn:ngsi-ld:AgentContainer:${containerId}`,
    type: 'AgentContainer',
    name: {
      type: 'Text',
      value: datasource.image,
    },
    agentType: {
      type: 'Text',
      value: datasource.agentType,
    },
    refDataSource: {
      type: 'RelationShip',
      value: JSON.parse(datasource.dataSource).id,
    },
  };
}
