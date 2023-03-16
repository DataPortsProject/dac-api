import express from 'express';
import logger from '../config/winston';
import { insertCygnus } from '../services/cygnus.service';

import CustomError from '../utils/CustomError';

import { randomString } from '../utils/random';

// eslint-disable-next-line import/prefer-default-export
export const router = express.Router();

// routes
router.post('/', insertToCygnus);

// Implementation

async function insertToCygnus(req, res) {
  const entity = req.body;

  try {
    logger.silly(`Cygnus entity ${JSON.stringify(entity)}`);
    let randomStr = '';
    randomStr = randomString(64, '#A!');
    logger.silly(`RANDOM_ID ${randomStr}`);

    const dataToCygnus = {
      subscriptionId: randomStr,
      data: entity,
    };
    logger.silly(`data_to_Cygnus ${JSON.stringify(dataToCygnus)}`);
    const data = await insertCygnus(dataToCygnus);
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
