import express from 'express';
import { check } from 'express-validator';
import logger from '../config/winston';
import pythonTemplateService from '../services/pythonTemplate.service';

import util from '../middlewares/util';

import variables from '../utils/variables';
import CustomError from '../utils/CustomError';

import { randomString } from '../utils/random';
// eslint-disable-next-line
import { constructPythonTemplate, updateTemplate } from '../utils/Mapping';

const AdmZip = require('adm-zip');
const ZIP = require('express-zip');
const fs = require('fs');

const router = express.Router();

// routes
router.get('/', getAll);
router.get('/:id', getPythonTemplate);
router.post(
	'/',
	[
		check('source').isIn(['agent-api', 'agent-local-txt', 'agent-local-excel']),
		check('type').isIn(['publish-subscribe', 'on-demand'])
	],
	util.sendValidations,
	createPythonTemplate
);
router.delete('/:id', deletePythonTemplate);
router.put(
	'/:id',
	[
		check('source').isIn(['agent-api', 'agent-local-txt', 'agent-local-excel']),
		check('type').isIn(['publish-subscribe', 'on-demand'])
	],
	util.sendValidations,
	updatePythonTemplate
);
router.post('/getZIPTemplate', getZIPTemplate);

export default router;

// Implementación
async function getPythonTemplate(req, res) {
	const { params: { id } = { id: null } } = req;

	try {
		const data = await pythonTemplateService.getPythonTemplate(id);
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

async function getAll(req, res) {
	const { query } = req;
	try {
		const data = await pythonTemplateService.getAll();
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

async function deletePythonTemplate(req, res) {
	const { params: { id } = { id: null } } = req;

	try {
		const data = await pythonTemplateService.deletePythonTemplate(id);
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

async function createPythonTemplate(req, res) {
	const template = constructPythonTemplate(req.body);

	try {
		const data = await pythonTemplateService.createPythonTemplate(template);
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

async function updatePythonTemplate(req, res) {
	const { params: { id } = { id: null } } = req;
	const template = updateTemplate(req.body);

	try {
		const data = await pythonTemplateService.updatePythonTemplate(id, template);
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

function getZIPTemplate(req, res) {
	let folderName = '';
	let query = null;
	const directory = '';

	try {
		query = req.body;
		// console.log('json schema');
		// console.log(query.jsonSchemaSerialized);

		folderName = Date.now();

		const folderDirectory = `./src/zips/${folderName}`;
		// -- Create folder --
		fs.mkdir(folderDirectory, { recursive: true }, err => {
			if (err) throw err;
		});

		const promises = [
			readFromFile(query.constants, 'CONSTANTS', query, folderDirectory),
			readFromFile(query.script, 'SCRIPT', query, folderDirectory),
			readFromFile(query.dockerFile, 'DOCKERFILE', query, folderDirectory),
			generateDataSource(`./src/zips/${folderName}/DataSource.json`, query),
			new Promise((resolve, reject) => {
				setTimeout(() => {
					console.log('Agrego ficheros al ZIP');

					const zip = new AdmZip();
					zip.addLocalFile(`./src/zips/${folderName}/constants.py`);
					zip.addLocalFile(`./src/zips/${folderName}/script.py`);
					zip.addLocalFile(`./src/zips/${folderName}/Dockerfile`);

					zip.addLocalFile('./src/templates/Readme.txt');

					zip.addLocalFile(`./src/zips/${folderName}/DataSource.json`);

					const downloadName = `${Date.now()}.zip`;

					zip.writeZip(`./src/zips/${folderName}/${downloadName}`);

					const filePath = `./src/zips/${folderName}/${downloadName}`;

					fs.exists(filePath, function(exists) {
						if (exists) {
							res.writeHead(200, {
								'Content-Type': 'application/zip',
								'Content-Disposition': `attachment; filename=${downloadName}`
							});
							fs.createReadStream(filePath).pipe(res);
							// Delete the zip folder and their content
							setTimeout(() => {
								deleteFolderRecursive(`./src/zips/${folderName}`);
								console.log('Borramos el directorio');
							}, 4 * 1000);
						} else {
							res.writeHead(400, {
								'Content-Type': 'text/plain'
							});
							res.end('Error file does not exist');
						}
					});
				}, 4000);
			}) //
		];

		Promise.all(promises).then(result => {
			console.log(result);
			const constantsFile = result[0];
			const scriptFile = result[1];
			const dockerFile = result[2];
			const datasource = result[3];
			// do more stuff
		});
	} catch (error) {
		console.log(error);
		logger.error(error);
		if (error instanceof CustomError) {
			const { message, name, stack, type } = error;
			return res.status(type).json({
				status: 'Error',
				message: 'An error occurred'
			});
		}
	}
	return null;
}

// Function to complete getZIPTemplate!!
function readFromFile(file, fileType, query, folderDirectory) {
	let directory = '';
	let random_string = '';
	// random_string = randomString(16, 'aA');

	const d = new Date();
	const n = d.getMinutes();
	// console.log(`MINUTES: ${n}`);
	// console.log(n % 2);
	// RANDOM STRING WILL DEPEND ON THE MODULE OPERATOR
	if (n % 2) {
		// console.log(32);
		random_string = randomString(32, '#aA');
	} else {
		// console.log(64);
		random_string = randomString(64, '#A!');
	}
	// console.log(random_string);

	console.log('READ FILE');
	console.log(file);
	console.log(fileType);
	return new Promise((resolve, reject) => {
		fs.readFile(file, 'utf8', function(err, data) {
			if (err) {
				console.log(err);
				reject(err);
			} else {
				// resolve(data);
				switch (fileType) {
					case 'CONSTANTS':
						var fileUpdated = data.replace(
							/parameter_timeInterval/gim,
							query.time_interval
						);
						var timeUnit_newValue = fileUpdated.replace(
							/parameter_timeUnit/gim,
							`"${query.time_unit}"`
						);

						var callback_parameter = timeUnit_newValue.replace(
							/parameter_CallbackURL/gim,
							`"${query.callback_url}"`
						);

						var randomID_parameter = callback_parameter.replace(
							/parameter_random/gim,
							`"${random_string}"`
						);

						directory = `${folderDirectory}/constants.py`;

						fs.writeFile(directory, randomID_parameter, 'utf-8', function(err, data) {
							if (err) throw err;
							console.log('Done! Constants');
						});

						break;
					case 'SCRIPT':
						var urlParameter = data.replace(/parameter_urlAPI/gim, query.url_api);
						var orionUrlParameter = urlParameter.replace(
							/parameter_urlORION/gim,
							query.orion_url
						);
						var orionPortParameter = orionUrlParameter.replace(
							/parameter_orionPORT/gim,
							query.orion_port
						);
						var dataProviderParameter = orionPortParameter.replace(
							/parameter_dataProvider/gim,
							query.data_provider
						);
						// create data model properties
						var dataModel_properties = '';
						query.fieldsUsed_DataModel.forEach(prop => {
							if (dataModel_properties == '') {
								dataModel_properties = `${'m.add(' + '"'}${prop.id}"` + `,"")`;
							} else {
								dataModel_properties =
									`${dataModel_properties}\n` +
									`m.add(` +
									`"${prop.id}"` +
									`,"")`;
							}
						});
						var dataModelParameter = dataProviderParameter.replace(
							/parameter_dataModel/gim,
							dataModel_properties
						);

						// Data Model Type
						var dataModelTypeParameter = dataModelParameter.replace(
							/parameter_TypeDataModel/gim,
							query.dataModelType
						);

						// File Path parameter
						var filePathParameter = dataModelTypeParameter.replace(
							/parameter_filePath/gim,
							query.filepath
						);

						// File Name parameter
						var fileNameParameter = filePathParameter.replace(
							/parameter_fileName/gim,
							query.filename
						);

						console.log(`FILEPATH: ${query.filepath}`);

						directory = `${folderDirectory}/script.py`;

						fs.writeFile(directory, fileNameParameter, 'utf-8', function(err, data) {
							if (err) throw err;
							console.log('Done Script!');
						});
						break;
					case 'DOCKERFILE':
						var fileUpdated = data.replace(
							/parameter_timeInterval/gim,
							query.time_interval
						);
						var timeUnit_newValue = fileUpdated.replace(
							/parameter_timeUnit/gim,
							`"${query.time_unit}"`
						);

						var callback_parameter = timeUnit_newValue.replace(
							/parameter_CallbackURL/gim,
							`"${query.callback_url}"`
						);

						var random_parameter = callback_parameter.replace(
							/parameter_random/gim,
							`"${random_string}"`
						);

						directory = `${folderDirectory}/Dockerfile`;

						fs.writeFile(directory, random_parameter, 'utf-8', function(err, data) {
							if (err) throw err;
							console.log('Done Dockerfile!');
						});
						break;
					default:
						console.log('Nothing to do');
				}
			}
		});
	});
}

function deleteFolderRecursive(path) {
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function(file, index) {
			const curPath = `${path}/${file}`;
			if (fs.lstatSync(curPath).isDirectory()) {
				deleteFolderRecursive(curPath);
			} else {
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
}

function generateDataSource(directory, query) {
	return new Promise((resolve, reject) => {
		fs.writeFile(directory, JSON.stringify(query.jsonSchemaSerialized, null, 4), err => {
			if (err) {
				console.log(err);
				return;
			}
			console.log('Done DataSource!');
		});
	});
}
