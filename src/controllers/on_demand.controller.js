import express from 'express';
import logger from '../config/winston';
import onDemandService from '../services/on_demand.service';

import agentService from '../services/agents.service';
import infoService from '../services/info.service';

import { requestContainerObj } from '../utils/Mapping';
import CustomError from '../utils/CustomError';

const router = express.Router();

// routes
router.post('/createContainer', createContainer);
// router.post('/latestValues', latestValues);
router.post('/', historicalValues);

export default router;

// Implementation
// FIXME: Ahora estamos cogiendo funciones de otros servicios. Igual habría que abstraer esas funciones
// o replicarlas en el servicio on_demand
async function historicalValues(req, res) {
	const query = requestContainerObj(req.body);
	console.log(query);

	try {
		const { name } = req.body;

		// Hacemos el getTemplate para obtener el random_id
		const template = await agentService.getTemplate(name);
		let random_id = '';
		template.environment.forEach(env => {
			if (env.key === 'RANDOM_ID') {
				random_id = env.value;
			}
		});

		// Hacemos una insercion en mongo
		const mongoObj = {
			random_id,
			container_name: name
		};

		await infoService.create(mongoObj);

		// Creamos el contenedor
		const data = await onDemandService.createContainer(name, query);

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
}

async function createContainer(req, res) {
	const query = requestContainerObj(req.body);

	try {
		const { name } = req.body;
		const container = await onDemandService.createContainer(name, query);
		console.log(container);

		const data = responseContainerObject(container);
		console.log(data);

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
