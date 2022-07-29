import express from 'express';
import logger from '../config/winston';

import infoService from '../services/info.service';
import CustomError from '../utils/CustomError';

import { constructInfoObject } from '../utils/Mapping';

const router = express.Router();

// routes
router.get('/:id', getOne);
router.get('/', getAll);
router.post('/', create);
router.delete('/:id', deleteInfo);
router.post('/filtered', getFiltered);
router.delete('/container/:id', deleteInfoByContainer);

export default router;

// Implementation
async function getOne(req, res) {
	const { params: { id } = { id: null } } = req;

	try {
		const data = await infoService.getOne(id);
		res.status(200).json({
			status: 'OK',
			message: data
		});
	} catch (error) {
		logger.error(error);
		if (error instanceof CustomError) {
			const { message, name, stack, type } = error;
			return res.status(type).json({
				status: name,
				message: message.message
			});
		}
		return res.status(404).json({
			status: 'Error',
			message: 'An error occurred'
		});
	}
	return null;
}

async function getAll(req, res) {
	const { query } = req;

	try {
		const data = await infoService.getAll(query);
		res.status(200).json({
			status: 'OK',
			message: data
		});
	} catch (error) {
		logger.error(error);
		if (error instanceof CustomError) {
			const { message, name, stack, type } = error;
			return res.status(type).json({
				status: name,
				message: message.message
			});
		}
		return res.status(404).json({
			status: 'Error',
			message: 'An error occurred'
		});
	}
	return null;
}

async function deleteInfo(req, res) {
	const { params: { id } = { id: null } } = req;

	try {
		const data = await infoService.deleteInfo(id);
		res.status(200).json({
			status: 'OK',
			message: data
		});
	} catch (error) {
		logger.error(error);
		if (error instanceof CustomError) {
			const { message, name, stack, type } = error;
			return res.status(type).json({
				status: name,
				message: message.message
			});
		}
		return res.status(404).json({
			status: 'Error',
			message: 'An error occurred'
		});
	}
	return null;
}

async function deleteInfoByContainer(req, res) {
	const { params: { id } = { id: null } } = req;

	try {
 
   console.log('DELETE INFO BY CONTAINER')
   console.log(id)

		const data = await infoService.deleteInfoByContainer(id);
		res.status(200).json({
			status: 'OK',
			message: data
		});
	} catch (error) {
		logger.error(error);
		if (error instanceof CustomError) {
			const { message, name, stack, type } = error;
			return res.status(type).json({
				status: name,
				message: message.message
			});
		}
		return res.status(404).json({
			status: 'Error',
			message: 'An error occurred'
		});
	}
	return null; 
}

async function getFiltered(req, res) {

  try {
	  const id = req.body.random_id;
	  const interval = req.body.time_interval;
	  const unit = req.body.time_unit;

	  const data = await infoService.getFiltered(id, interval, unit);
    res.status(200).json({
		  status: 'OK',
		  message: data
	  });

  } catch (error) {
	  logger.error(error);
	  if (error instanceof CustomError) {
		  const { message, name, stack, type } = error;
		  return res.status(type).json({
			  status: name,
			  message: message.message
		  });
	  }
	  return res.status(404).json({
		  status: 'Error',
		  message: 'An error occurred'
	  });
  }
  return null;
}

async function create(req, res) {
	const query = constructInfoObject(req.body);

	try {
		const data = await infoService.create(query);
		res.status(200).json({
			status: 'OK',
			message: data
		});
	} catch (error) {
		logger.error(error);
		if (error instanceof CustomError) {
			const { message, name, stack, type } = error;
			return res.status(type).json({
				status: name,
				message: message.message
			});
		}
		return res.status(404).json({
			status: 'Error',
			message: 'An error occurred'
		});
	}
	return null;
}
