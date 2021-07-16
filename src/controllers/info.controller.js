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
