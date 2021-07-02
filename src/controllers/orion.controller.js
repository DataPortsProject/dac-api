import express from 'express';
import logger from '../config/winston';
import orionService from '../services/orion.service';

import CustomError from '../utils/CustomError';

const router = express.Router();

// routes

router.get('/:type/entitiesByType', getEntitiesByType);
router.get('/getSubscriptions', getSubscriptions);
router.get('/checkDatasource', checkDatasource);
router.get('/getAgentsAsociated', getAgentsAsociated);
router.post('/createEntity', createEntity);
router.delete('/:id', deleteEntity);

export default router;

// Implementation
async function getEntitiesByType(req, res) {
	const { params: { type } = { type: null } } = req;
	try {
		const data = await orionService.getEntitiesByType(type);
		res.status(200).json({
			status: 'OK',
			message: data
		});
	} catch (error) {
		logger.error(error);
		if (error instanceof CustomError) {
			const { message, name, stack, type } = error;
			// message --> error reported by Docker's API
			// name --> name of the class (always will be 'Error')
			// stack --> where the error is located?
			// type --> HttpStatusCode reported by Docker's API
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

async function createEntity(req, res) {
	const entity = req.body;

	try {
		const data = await orionService.createEntity(entity);
		res.status(200).json({
			status: 'OK',
			message: data
		});
	} catch (error) {
		logger.error(error);
		if (error instanceof CustomError) {
			// eslint-disable-next-line
			const { message, name, stack, type } = error;
			return res.status(type).json({
				status: name,
				message: message.message
			});
		}
		return res.status(404).json({
			error: {
				status: 'Error',
				message: 'An error occurred'
			}
		});
	}
	return null;
}

async function deleteEntity(req, res) {
	const { params: { id } = { id: null } } = req;

	try {
		const data = await orionService.deleteEntity(id);
		res.status(200).json({
			status: 'OK',
			message: data
		});
	} catch (error) {
		logger.error(error);
		if (error instanceof CustomError) {
			// eslint-disable-next-line
			const { message, name, stack, type } = error;
			return res.status(type).json({
				status: name,
				message: message.message
			});
		}
		return res.status(404).json({
			error: {
				status: 'Error',
				message: 'An error occurred'
			}
		});
	}
	return null;
}

async function getSubscriptions(req, res) {
	try {
		const data = await orionService.getORIONSubscription();
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

async function checkDatasource(req, res) {
	const { query: { entityType } = { entityType: null } } = req;
	const { query: { datasourceId } = { datasourceId: null } } = req;

	try {
		const data = await orionService.checkORIONDatasource(entityType, datasourceId);
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

async function getAgentsAsociated(req, res) {
	const { query: { agentType } = { agentType: null } } = req;
	const { query: { dataSourceId } = { dataSourceId: null } } = req;

	try {
		const data = await orionService.getORIONAgentsAsociated(agentType, dataSourceId);
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
