import { sendInfo } from '../api/cygnus';

import logger from '../config/winston';

// Implementation
// eslint-disable-next-line import/prefer-default-export
export async function infoToCygnus(entity) {
  return sendInfo(entity).catch((error) => {
    logger.error(error.toString());
    throw new Error(error);
  });
}
