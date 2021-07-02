/* eslint-disable no-unused-vars */
import axios from 'axios';
import { setupCache } from 'axios-cache-adapter';
import config from '../config/config';
// TODO: Implemnent cache for request fiware keyrock

// Create `axios-cache-adapter` instance
const cache = setupCache({
  maxAge: 15 * 60 * 1000
});

// Create `axios` instance passing the newly created `cache.adapter`
const api = axios.create({
  adapter: cache.adapter
});

const middleware = {};

middleware.authUser = authUser;
middleware.authApi = authApi;
middleware.isAuthorized = isAuthorized;

async function authUser(req, res, next) {
  if (process.env.NODE_ENV !== 'production') {
    req.user = { id: 'demo', name: 'demo' };
    next();
  } else {
    if (!req.headers['x-token']) {
      return res.status(400).json({
        error: {
          message: 'You did not specify any token for this request'
        }
      });
    }
    try {
      const response = await api({
        method: 'GET',
        url: `${config.fiware.IDM_URL}/user?access_token=${req.headers['x-token']}`
      });
      const { data } = response;
      if (!data) {
        throw new Error('User not permit');
      }
      data.name = data.username;

      req.user = data;

      next();
    } catch (error) {
      return res.status(401).json({
        error: {
          message: 'You did not specify a valid token for this request'
        }
      });
    }
  }
  return null;
}

async function authApi(req, res, next) {
  if (req.headers['x-token'] === config.auth.master) {
    next();
  } else {
    return res.status(500).json({
      error: {
        message: 'You did not specify a valid token for this request'
      }
    });
  }
  return null;
}

async function isAuthorized(req, res, next) {
  if (req.user) {
    next();
  } else {
    return res.status(401).json({
      error: {
        message: 'You are not authorised to perform this action. SignUp/Login to continue'
      }
    });
  }
  return null;
}

export default middleware;
