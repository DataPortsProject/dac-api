import express from 'express';
import logger from '../config/winston';
import * as pubsubService from '../services/pubsub.service';

// eslint-disable-next-line import/prefer-default-export
export const router = express.Router();

// routes
router.get('/getTemplate', getTemplate);
router.post('/createContainer', createContainer);
router.post('/startContainer', startContainer);
router.post('/stopContainer', stopContainer);

async function getTemplate(_req, res) {
  try {
    const data = await pubsubService.getTemplate();
    return res.json(wrapperOk(data));
  } catch (error) {
    logger.error(error.toString());
    return res.status(404).json({
      error: {
        code: 54910,
        message: 'An error occurred',
      },
    });
  }
}

async function createContainer(req, res) {
  const query = req.body;
  try {
    const data = await pubsubService.createContainer(query);

    return res.json(wrapperOk(data));
  } catch (error) {
    logger.error(error.toString());
    return res.status(404).json({
      error: {
        code: 54910,
        message: 'An error occurred',
      },
    });
  }
}

async function startContainer(req, res) {
  const query = req.body;
  try {
    const data = await pubsubService.startContainer(query);

    return res.json(wrapperOk(data));
  } catch (error) {
    logger.error(error.toString());
    return res.status(404).json({
      error: {
        code: 54910,
        message: 'An error occurred',
      },
    });
  }
}

async function stopContainer(req, res) {
  const query = req.body;
  try {
    const data = await pubsubService.stopContainer(query);

    return res.json(wrapperOk(data));
  } catch (error) {
    logger.error(error.toString());
    return res.status(404).json({
      error: {
        code: 54910,
        message: 'An error occurred',
      },
    });
  }
}

// eslint-disable-next-line
function makeObj(body) {
  const query = {};

  if (body.source) {
    query.source = body.source;
  }

  if (body.agent) {
    query.agent = body.agent;
  }

  if (body.callBack_url) {
    query.callBack_url = body.callBack_url;
  } else {
    query.callBack_url = '';
  }

  return query;
}

function wrapperOk(data) {
  return { data, code: 20000 };
}
