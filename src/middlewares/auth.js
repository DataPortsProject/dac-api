/* eslint-disable no-unused-vars */
import axios from 'axios';
import { setupCache } from 'axios-cache-adapter';
import config from '../config/config';
import logger from '../config/winston';

// Create `axios-cache-adapter` instance
const cache = setupCache({
  maxAge: 15 * 60 * 1000,
});

// Create `axios` instance passing the newly created `cache.adapter`
const api = axios.create({
  adapter: cache.adapter,
});

export async function authUser(req, res, next) {
  if (process.env.NODE_ENV !== 'production') {
    req.user = {
      id: 'demo',
      name: 'demo',
      email: 'demo@dataports.org',
      roles: [],
    };
    return next();
  }
  if (!req.header('Authorization')) {
    logger.error('Rejected request due to missing token');
    return res.status(401).json({
      error: {
        method: 'authUser',
        message: 'You did not specify any token for this request',
      },
    });
  }
  try {
    const token = (req.header('Authorization') || '').replace(/bearer /i, '');
    const decoded = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString()
    );

    req.user = {
      name: decoded.DPuser,
      email: decoded.email,
      id: decoded.sub,
      roles: decoded.DProle,
    };

    return next();
  } catch (error) {
    logger.error('Rejected request due to invalid token');
    return res.status(401).json({
      error: {
        method: 'authUser',
        message: 'You did not specify a valid token for this request',
      },
    });
  }
}

export async function authApi(req, res, next) {
  if (req.header('x-token') === config.auth.master) {
    return next();
  }

  return res.status(500).json({
    error: {
      message: 'You did not specify a valid token for this request',
    },
  });
}

export async function isAuthorized(req, res, next) {
  if (req.user) {
    return next();
  }
  return res.status(401).json({
    error: {
      message:
        'You are not authorised to perform this action. SignUp/Login to continue',
    },
  });
}
