import express from 'express';
import logger from '../config/winston';

import notificationService from '../services/notification.service';
import CustomError from '../utils/CustomError';

import { constructNotification } from '../utils/Mapping';

import variables from '../utils/variables';
import agentService from '../services/agents.service';
import orionService from '../services/orion.service';

import wsSocket from '../utils/wsSocket';

import { sleep } from '../utils/utilities';

const webSocket = new wsSocket(3010);

/* const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', ws => {
	ws.on('message', message => {
		console.log(`Received message => ${message}`);
	});
	ws.send('Hello! Message From Server!!');
}); */

const router = express.Router();

// routes
router.get('/:id', getOne);
router.get('/', getAll);
router.post('/', create);
router.delete('/:id', deleteNotification);
router.patch('/manageOnDemandContainers/:id', manageOnDemandContainers);

export default router;

// Implementation
async function getOne(req, res) {
	const { params: { id } = { id: null } } = req;

	try {
		const data = await notificationService.getOne(id);
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
		const data = await notificationService.getAll(query);
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

async function deleteNotification(req, res) {
	const { params: { id } = { id: null } } = req;
	const query = req.body;

	try {
		const data = await notificationService.deleteNotification(id, query);
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
	const query = constructNotification(req.body);

	try {
		const data = await notificationService.create(query);

		res.status(200).json({
			status: 'OK',
			message: data
		});
		console.log('Voy a enviar la notificación por WebSocket');
		const { socket } = webSocket;
		// console.log(data);
		// console.log(socket);
		const message = `${data.id},${data.type},${data.message}`;
		socket.send(message);
		// sleep(1000);
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

async function manageOnDemandContainers(req, res) {
	const { params: { id } = { id: null } } = req;

	if (!id) {
		return res.status(variables.INTERNAL_SERVER_ERROR).json({
			status: 'Validation',
			message: 'Malformed url'
		});
	}

	try {
        const inspectAgent = await agentService.inspectAgent(id);
		
		let imageID = inspectAgent.Id;
		let imageName = inspectAgent.Image;

		const stopped = await agentService.stopAgent(id);
		
		const removed = await agentService.deleteAgent(id);

		const notificationData = {
			'id': id,
			'type': 'SUCCESS',
			'message': 'On-Demand Agent removed',
			'register': ''
		}

		const query = constructNotification(notificationData);

		const data_notification = await notificationService.create(query);

		res.status(200).json({
			status: 'OK',
			message: data_notification
		});
		console.log('Voy a enviar una notificación para indicar que borro el contenedor on-demand');
		const { socket } = webSocket;
		const message = `${data_notification.id},${data_notification.type},${data_notification.message}`;
		socket.send(message);

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
