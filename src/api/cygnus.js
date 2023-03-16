import variables from '../utils/variables';
import client from '../utils/request_cygnus';
import requestNodeRED from '../utils/request_nodeRED';

import logger from '../config/winston';

export async function insert(entities) {
  logger.debug(`About to insert ${entities.data.length} entities in cygnus`);
  // needed by cygnus to know how many entities are present in the body
  const servicepath = entities.data.map(() => '/').join(',');
  logger.debug(`Just before sending http request for ${entities.subscriptionId}`);

  return client({
    url: '/notify',
    method: variables.METHOD_POST,
    data: entities,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Ngsiv2-Attrsformat': 'normalized',
      'fiware-servicepath': servicepath,
    },
  })
    .then((response) => {
      logger.debug(`Response for ${entities.subscriptionId}`);
      return response;
    })
    .catch((err) => {
      logger.debug(`Error for ${entities.subscriptionId}`);
      return Promise.reject(err);
    });
}

export function sendInfo(entity) {
  logger.debug(
    `About to notify DAC data availability:\n${JSON.stringify(entity, null, 2)}`
  );
  return requestNodeRED({
    url: '/datanotify',
    method: variables.METHOD_POST,
    data: entity,
    headers: {
      'Content-Type': variables.APPLICATION_JSON,
      Accept: variables.APPLICATION_JSON,
    },
  });
}
