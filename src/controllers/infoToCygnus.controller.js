import express from 'express';
import logger from '../config/winston';
import { infoToCygnus } from '../services/infoToCygnus.service';

import CustomError from '../utils/CustomError';

// eslint-disable-next-line import/prefer-default-export
export const router = express.Router();

// routes
router.post('/', sendInfoToCygnus);

// Implementation

async function sendInfoToCygnus(req, res) {
  const entity = req.body;

  try {
    logger.silly(`data_to_Cygnus ${JSON.stringify(entity)}`);
    const data = await infoToCygnus(entity);
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
