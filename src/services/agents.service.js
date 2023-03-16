import CustomError from '../utils/CustomError';
import {
  constructAgentsObj,
  constructInspectAgentObj,
  createTemplateObj,
} from '../utils/Mapping';
import logger from '../config/winston';

/* eslint-disable */
import {
  getAgents,
  createAgentDocker,
  startContainerCreated,
  stopContainerCreated,
  getLogs,
  inspectAgents,
  deleteAgentById,
  inspectImageById
} from '../api/docker_API';

// Lista todos los agentes
export async function getAllAgents() {
  try {
    return constructAgentsObj(await getAgents());
  } catch (error) {
    logger.error(`Failed retrieving agents:  ${error.toString()}`);
    if (error.isAxiosError) {
      if (error.response !== undefined) {
        throw new CustomError(error.response.data, error.response.status);
      } else {
        throw new CustomError(
          { message: { reason: error.code, context: error.message } },
          500,
          'Internal Server Error'
        );
      }
    }
    throw new CustomError(error.response.data, error.response.status);
  }
}

export async function getTemplate(containerName) {
  try {
    return createTemplateObj(await inspectImageById(containerName));
  } catch (error) {
    throw new CustomError(error.response.data, error.response.status);
  }
}

// Crea un agente y lo arranca
export async function createAgent(model) {
  try {
    let containerInfo = await createAgentDocker(model);
    // createAgent does not start the agent, we need to do it explicitelly
    await startAgent(containerInfo.Id);
    return containerInfo;
  } catch (error) {
    throw new CustomError(error.response.data, error.response.status);
  }
}

export async function startAgent(containerId) {
  try {
    return await startContainerCreated(containerId);
  } catch (error) {
    throw new CustomError(error.response.data, error.response.status);
  }
}

export async function stopAgent(id) {
  try {
    return await stopContainerCreated(id);
  } catch (error) {
    throw new CustomError(error.response.data, error.response.status);
  }
}

/**
 * Function that deletes an agent given its id
 * @param {*} id
 * @returns the agent id if the operation succeeds. If it fails, it throws a CustomError
 */
export async function deleteAgent(id) {
  try {
    return await deleteAgentById(id).then(() => id);
  } catch (error) {
    throw new CustomError(
      error.response && error.response.data ? error.response.data.message : '',
      error.response ? error.response.status : 0
    );
  }
}

export async function getLog(ID, since) {
  try {
    return await getLogs(ID, since);
  } catch (error) {
    throw new CustomError(error.response.data, error.response.status);
  }
}

export async function inspectAgent(id) {
  try {
    return constructInspectAgentObj(await inspectAgents(id));
  } catch (error) {
    throw new CustomError(error.response.data, error.response.status);
  }
}
