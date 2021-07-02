import express from 'express';
import logger from '../config/winston';
import onDemandService from '../services/on_demand.service';

import { requestContainerObj } from '../utils/Mapping';

const router = express.Router();

// routes
router.post('/createContainer', createContainer);
//router.post('/latestValues', latestValues);
router.post('/', historicalValues);

export default router;

// Implementation
async function historicalValues(req, res) {

  const query = requestContainerObj(req.body);
  console.log(query)

  try {

    const name = req.body.name;
    const data = await onDemandService.createContainer(name, query);

    res.status(200).json({
      status: 'OK',
      message: data
    })

  } catch (error) {

    logger.error(error);

    if (error instanceof CustomError) {
      const { message, name, stack, type } = error
      return res.status(type).json({
        status: name,
        message: message.message
      })
    } else {
      return res.status(404).json({
        status: 'Error',
        message: 'An error occurred'
      })
    }
  }
}


async function createContainer(req, res) {
  
  const query = requestContainerObj(req.body);
  
  try {
    
    const name = req.body.name;
    const container = await onDemandService.createContainer(name, query);
    console.log(container)

    const data = responseContainerObject(container);
    console.log(data)

    res.status(200).json({
      status: 'OK',
      message: data
    })
  } catch (error) {

    logger.error(error);

    if (error instanceof CustomError) {
      const { message, name, stack, type } = error
      return res.status(type).json({
        status: name,
        message: message.message
      })
    } else {
      return res.status(404).json({
        status: 'Error',
        message: 'An error occurred'
      })
    }

  }
  return null;
}
