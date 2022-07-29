import express from 'express';
import logger from '../config/winston';
import cygnusService from '../services/cygnus.service';

import CustomError from '../utils/CustomError';

import { randomString } from '../utils/random';

const router = express.Router();

// routes
router.post('/', insertCygnus);

export default router;

// Implementation

async function insertCygnus(req, res) {
  
	const entity = req.body;

	try {
    	console.log('--------------------------------------------------');
    	console.log('Cygnus');
    	console.log('ENTITY', entity);
	  	let random_string = '';
	  	random_string = randomString(64, '#A!');
    	console.log('RANDOM_ID', random_string);
 
		const data_to_Cygnus = {
			'subscriptionId': random_string,
			'data': entity
		};
    	console.log('data_to_Cygnus', data_to_Cygnus)
		const data = await cygnusService.insertCygnus(data_to_Cygnus);
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
