import express from 'express';
import { check } from 'express-validator';
import logger from '../config/winston';
import dataModelService from '../services/dataModel.service';

import util from '../middlewares/util';

import variables from '../utils/variables';
import CustomError from '../utils/CustomError';

// eslint-disable-next-line
import { constructDataModelObj, updateDataModelObj } from '../utils/Mapping';

const router = express.Router();

// routes
router.get('/', getAll);
router.post('/', createDataModel_Assigment);
router.delete('/:id', deleteDataModel);
router.put('/:id', updateDataModel);
router.post('/getSchema', getJsonSchema);

export default router;

// Implementación
async function getAll(req, res) {
	const { query } = req;
	try {
		const data = await dataModelService.getAll();
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
			message: 'An error ocurred'
		});
	}
	return null;
}

async function createDataModel_Assigment(req, res) {
	const dataModel = constructDataModelObj(req.body);

	try {
		const data = await dataModelService.createDataModel_Assigment(dataModel);
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

async function deleteDataModel(req, res) {
	const { params: { id } = { id: null } } = req;

	try {
		const data = await dataModelService.deleteDataModel(id);
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
			message: 'An error ocurred'
		});
	}
	return null;
}

async function updateDataModel(req, res) {
	console.log('UPDATE DATA MODEL');
	const { params: { id } = { id: null } } = req;
	const dataModel = updateDataModelObj(req.body);

	try {
		const data = await dataModelService.updateDataModel(id, dataModel);
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

async function getJsonSchema(req, res) {
	const properties = req.body;

	try {
		console.log(properties);
		const data = await dataModelService.getJsonSchema(properties);
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
