import express from 'express';
import logger from '../config/winston';
import agentsService from '../services/agents.service';

import variables from '../utils/variables';
import CustomError from '../utils/CustomError';

// eslint-disable-next-line
import { constructAgentTemplate } from '../utils/Mapping';

const router = express.Router();

// routes
router.get('/ngsiagent', ngsiagent);
router.post('/ngsiagent', createAgent);
router.patch('/ngsiagent/:id/start', startAgent);
router.patch('/ngsiagent/:id/stop', stopAgent);
router.get('/ngsiagent/:id/log', getLog);
router.get('/ngsiagent/:id/inspect', inspectAgent);
router.delete('/ngsiagent/:id', deleteAgent);
export default router;

// SW GET para listar todos los agentes
async function ngsiagent(req, res) {
	try {
		const data = await agentsService.ngsiagent();
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

// SW POST para crear y arrancar un agente
async function createAgent(req, res) {
	const model = constructAgentTemplate(req.body);

	if (!model.Image) {
		return res.status(variables.INTERNAL_SERVER_ERROR).json({
			status: 'Validation',
			message: 'You must input an image'
		});
	}

	try {
		const data = await agentsService.createAgent(model);
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

// SW PATCH para crear y arrancar un agente
async function startAgent(req, res) {
	const { params: { id } = { id: null } } = req;

	if (!id) {
		return res.status(variables.INTERNAL_SERVER_ERROR).json({
			status: 'Validation',
			message: 'Malformed url'
		});
	}

	try {
		const data = await agentsService.startAgent(id);
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

// SW PATCH para parar un agente que esté corriendo
async function stopAgent(req, res) {
	const { params: { id } = { id: null } } = req;

	if (!id) {
		return res.status(variables.INTERNAL_SERVER_ERROR).json({
			status: 'Validation',
			message: 'Malformed url'
		});
	}

	try {
		const data = await agentsService.stopAgent(id);
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

// SW Para borrar un agente
async function deleteAgent(req, res) {
	const { params: { id } = { id: null } } = req;

	try {
		const data = await agentsService.deleteAgent(id);
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
			status: 'Error',
			message: 'An error occurred'
		});
	}
	return null;
}

// SW GET para listar todos los agentes
async function getLog(req, res) {
	const { params: { id } = { id: null } } = req;
	const { query: { since } = { since: '' } } = req;

	try {
		const data = await agentsService.getLog(id, since);
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

// SW GET para inspeccionar un agente
async function inspectAgent(req, res) {
	const { params: { id } = { id: null } } = req;
	try {
		const data = await agentsService.inspectAgent(id);
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
