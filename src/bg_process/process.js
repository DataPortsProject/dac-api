import { getAgents, deleteAgentById } from '../api/docker_API';
import { constructAgentsObj } from '../utils/Mapping';
import { deleteEntities } from '../api/orion';

import logger from '../config/winston';

// eslint-disable-next-line import/prefer-default-export
export async function checkContainers() {
  logger.info('Checking stopped containers...');
  let agents;
  try {
    await getAgents().then((response) => {
      agents = constructAgentsObj(response);
    });
    agents.forEach(async (agent) => {
      if (agent.AgentType === 'on_demand' && agent.StatusCode === 'exited') {
        await deleteAgentById(agent.Id).then(
          async () => {
            logger.info(`Container ${agent.Id} deleted`);

            await deleteEntities(
              `urn:ngsi-ld:AgentImage:${agent.ImageID}`
            ).then(
              () => {
                logger.debug(
                  `Entity urn:ngsi-ld:AgentImage:${agent.ImageID} deleted`
                );
              },
              (error) => {
                logger.error(
                  'An error occured while deleting an orion entity...',
                  error
                );
              }
            );
          },
          (error) => {
            logger.error(
              'An error occured while deleting the container...',
              error
            );
          }
        );
      }
    });
  } catch (error) {
    logger.error('Failed retrieving agents... Reason:', error.toString());
  }
}
