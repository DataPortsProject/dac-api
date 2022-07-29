import express from 'express';
import logger from '../config/winston';
import infoToCygnusService from '../services/infoToCygnus.service';

import CustomError from '../utils/CustomError';

const router = express.Router();

// routes
router.post('/', infoToCygnus);

export default router;

// Implementation

async function infoToCygnus(req, res) {
	const entity = req.body;

	try {
		console.log('--------------------------------------------------');
		console.log('Cygnus');
		console.log('ENTITY', entity);

		const data_to_Cygnus = {
			key: 'value',
			key_1: 'value_1'
		};
		console.log('data_to_Cygnus', entity);
		const data = await infoToCygnusService.infoToCygnus(entity);
		res.status(200).json({
			status: 'OK',
			message: data
		});
	} catch (error) {
		console.log('ERROR', error);
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
