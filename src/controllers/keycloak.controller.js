import express from 'express';
import logger from '../config/winston';
import { getToken } from '../services/keycloak.service';

import CustomError from '../utils/CustomError';

// eslint-disable-next-line import/prefer-default-export
export const router = express.Router();

// routes
router.post('/getToken', getJWTToken);

// POST to retrieve token from KeyCloak
async function getJWTToken(req, res) {
  const { body } = req;

  try {
    const data = await getToken(body);
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
