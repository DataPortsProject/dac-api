import express from 'express';
import logger from '../config/winston';
import pubsubService from '../services/pubsub.service';

const router = express.Router();

// routes
router.get('/getTemplate', getTemplate);
router.post('/createContainer', createContainer);
router.post('/startContainer', startContainer);
router.post('/stopContainer', stopContainer);
export default router;

async function getTemplate(req, res) {
	try {
		const data = await pubsubService.getTemplate();
		res.json(wrapperOk(data));
	} catch (error) {
		logger.error(error);
		return res.status(404).json({
			error: {
				code: 54910,
				message: 'An error occurred'
			}
		});
	}
	return null;
}

async function createContainer(req, res) {
	const query = req.body;
	try {
		const data = await pubsubService.createContainer(query);

		res.json(wrapperOk(data));
	} catch (error) {
		logger.error(error);
		return res.status(404).json({
			error: {
				code: 54910,
				message: 'An error occurred'
			}
		});
	}
	return null;
}

async function startContainer(req, res) {
	const query = req.body;
	try {
		const data = await pubsubService.startContainer(query);

		res.json(wrapperOk(data));
	} catch (error) {
		logger.error(error);
		return res.status(404).json({
			error: {
				code: 54910,
				message: 'An error occurred'
			}
		});
	}
	return null;
}

async function stopContainer(req, res) {
	const query = req.body;
	try {
		const data = await pubsubService.stopContainer(query);

		res.json(wrapperOk(data));
	} catch (error) {
		logger.error(error);
		return res.status(404).json({
			error: {
				code: 54910,
				message: 'An error occurred'
			}
		});
	}
	return null;
}

// eslint-disable-next-line
function makeObj(body) {
	const query = {};

	if (body.source) {
		query.source = body.source;
	}

	if (body.agent) {
		query.agent = body.agent;
	}

	if (body.callBack_url) {
		query.callBack_url = body.callBack_url;
	} else {
		query.callBack_url = '';
	}

	return query;
}

function wrapperOk(data) {
	return { data, code: 20000 };
}
