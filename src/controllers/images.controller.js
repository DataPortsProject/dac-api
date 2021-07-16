import express from 'express';
import logger from '../config/winston';
import imagesService from '../services/images.service';

import CustomError from '../utils/CustomError';

const router = express.Router();

// routes
router.get('/', getAll);
router.get('/:id/template', getTemplate);
router.get('/:id/config_datasource', getDataSource);
router.delete('/:id', deleteImage);
router.get('/getImagesFromExternalRepository', getImagesFromExternalRepository);
router.post('/downloadImage', downloadImageFromGitlab);

export default router;

// Implementation
async function getAll(req, res) {
	try {
		const data = await imagesService.getAll();
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

// Id weather_env: sha256:e4fda8d01a0ccb4db9c785b4cbd3b0219ab2f9a5efc23592e6a5be6275030d5f

async function getDataSource(req, res) {
	const { params: { id } = { id: null } } = req;

	try {
		if (id.length !== 71) {
			return res.status(500).json({
				status: 'Validation',
				message: 'Image ID is not valid'
			});
		}
		const data = await imagesService.getDataSource(id);
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

async function getTemplate(req, res) {
	const { params: { id } = { id: null } } = req;

	try {
		if (id.length !== 71) {
			return res.status(500).json({
				status: 'Validation',
				message: 'Image ID is not valid'
			});
		}
		const data = await imagesService.getTemplate(id);
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

async function deleteImage(req, res) {
	const { params: { id } = { id: null } } = req;

	try {
		const data = await imagesService.deleteImage(id);
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

// TODO: Request para traerse imagenes de un repositorio externo
async function getImagesFromExternalRepository(req, res) {
	try {
		const data = await imagesService.getImagesFromExternalRepository();
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

async function downloadImageFromGitlab(req, res) {
	const { path } = req.body;

	try {
		const data = await imagesService.downloadImageFromGitlab(path);
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
