import { stringify } from 'querystring';
import variables from '../utils/variables';
import dockerRequestFactory from '../utils/dockerRequestFactory';

import logger from '../config/winston';

export function createContainerFromImage(name, dataString) {
  logger.debug(
    `Creating docker container from image ${JSON.stringify(dataString)}`
  );
  return dockerRequestFactory({
    url: `/containers/create?name=${name}`,
    method: variables.METHOD_POST,
    data: dataString,
    headers: {
      'Content-Type': variables.APPLICATION_JSON,
      Accept: variables.APPLICATION_JSON,
    },
  });
}

function findDataAccessManagerNetwork() {
  const filters = stringify({
    filters: JSON.stringify({ name: ['data_access_manager'] }),
  });
  logger.debug('Looking for data_access_manager network');
  return dockerRequestFactory({
    url: `/networks?${filters}`,
    method: variables.METHOD_GET,
    headers: {
      'Content-Type': variables.APPLICATION_JSON,
      Accept: variables.APPLICATION_JSON,
    },
  }).then((results) => results[0]);
}

function attachContainerToNetwork(containerId, networkId) {
  logger.debug(`Connecting container ${containerId} to network ${networkId}`);
  return dockerRequestFactory({
    url: `/networks/${networkId}/connect`,
    data: {
      container: containerId,
    },
    method: variables.METHOD_POST,
    headers: {
      'Content-Type': variables.APPLICATION_JSON,
      Accept: variables.APPLICATION_JSON,
    },
  });
}

// ---- IMAGES ----
export function getImages() {
  const filters = stringify({
    filters: JSON.stringify({
      label: ['ngsiagent.project=dataports'],
      dangling: ['false'],
    }),
  });
  return dockerRequestFactory({
    url: `/images/json?${filters}`,
    method: variables.METHOD_GET,
  });
}

// ---- IMAGES ----
export function queryImagesWithToken(authorize) {
  return dockerRequestFactory({
    url: '/images/json',
    method: variables.METHOD_GET,
    headers: {
      'Content-Type': variables.APPLICATION_JSON,
      Authorization: authorize,
    },
  });
}

export function inspectImageById(id) {
  logger.debug(`Inpecting docker image with id: ${id}`);
  return dockerRequestFactory({
    url: `/images/${id}/json`,
    method: variables.METHOD_GET,
  });
}

export function deleteImageByID(id) {
  logger.debug(`Requested deletion of docker image with id: ${id}`);
  return dockerRequestFactory({
    url: `/images/${id}?force=true`,
    method: variables.METHOD_DELETE,
  });
}

export function getAgents() {
  return dockerRequestFactory({
    url: '/containers/json?all=true',
    method: variables.METHOD_GET,
  });
}

/**
 * Method that creates a docker container and attaches it to a docker network
 * @param {*} data
 * @returns
 */
export function createAgentDocker(data) {
  return dockerRequestFactory({
    url: `containers/create?name=${data.ContainerName}`,
    method: variables.METHOD_POST,
    // eslint-disable-next-line
    data: data,
    headers: {
      'Content-Type': variables.APPLICATION_JSON,
      Accept: variables.APPLICATION_JSON,
    },
  })
    .then((container) => {
      logger.debug(`Created container with id ${container.Id}`);
      return findDataAccessManagerNetwork().then((network) => {
        logger.debug(JSON.stringify(network));
        logger.debug(`found network with id ${network.Id}`);
        return attachContainerToNetwork(container.Id, network.Id).then(
          () => container
        );
      });
    })
    .catch((err) => logger.error(err));
}

// eslint-disable-next-line
/**
 * Method that starts an existing docker container using https://docs.docker.com/engine/api/v1.41/#tag/Container/operation/ContainerStart
 * @param {*} id container id to start
 * @returns
 */
export function startContainerCreated(id) {
  logger.debug(`Starting docker container with id: ${id}`);
  return dockerRequestFactory({
    url: `/containers/${id}/start`,
    method: variables.METHOD_POST,
    data: {},
    headers: {
      'Content-Type': variables.APPLICATION_JSON,
      Accept: variables.APPLICATION_JSON,
    },
  });
}

// eslint-disable-next-line
export function stopContainerCreated(id) {
  logger.debug(`Stopping docker container with id: ${id}`);
  return dockerRequestFactory({
    url: `/containers/${id}/stop`,
    method: variables.METHOD_POST,
    timeout: 15000,
    data: {},
    headers: {
      'Content-Type': variables.APPLICATION_JSON,
      Accept: variables.APPLICATION_JSON,
    },
  });
}

export function stopContainerCreatedNew(id) {
  const requestOptions = {
    method: variables.METHOD_POST,
    redirect: 'follow',
  };

  return fetch(
    `${variables.LOCAL_DOCKER_API}/containers/${id}/stop`,
    requestOptions
  )
    .then((response) => response.json())
    .then((responseData) => responseData)
    .catch((error) => error);
}

// eslint-disable-next-line
export function deleteAgentById(id) {
  logger.debug(`Deleting agent with id: ${id}`);
  return dockerRequestFactory({
    url: `/containers/${id}`,
    method: variables.METHOD_DELETE,
  });
}

// eslint-disable-next-line
export function getLogs(id, since) {
  return dockerRequestFactory({
    url: `/containers/${id}/logs?stderr=1&stdout=1&since=${since}`,
    method: variables.METHOD_GET,
  });
}

// eslint-disable-next-line
export function inspectAgents(id) {
  return dockerRequestFactory({
    url: `/containers/${id}/json`,
    method: variables.METHOD_GET,
  });
}

export function getImagesFromExternalDockerRepository() {
  return dockerRequestFactory({
    url: '/containers/images/json',
    method: variables.METHOD_GET,
  });
}
