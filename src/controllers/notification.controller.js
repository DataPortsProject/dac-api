import express from 'express';
import logger from '../config/winston';

import notificationService from '../services/notification.service';
import CustomError from '../utils/CustomError';

import { constructNotification } from '../utils/Mapping';

import wsSocket from '../utils/wsSocket';

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
