import PythonTemplate from '../models/PythonTemplate.model';

import { createFilesForZIP } from '../utils/utilities';

const fs = require('fs');

const service = {}

service.getPythonTemplate = getPythonTemplate;
service.getAll = getAll;
service.deletePythonTemplate = deletePythonTemplate;
service.createPythonTemplate = createPythonTemplate;
service.updatePythonTemplate = updatePythonTemplate;
service.getZIPTemplate = getZIPTemplate;

export default service

// Implementation

async function getPythonTemplate(id) {
	let data = [];
	try {
	  data = await PythonTemplate.findOne({ _id: id });
	} catch (error) {
	  throw new Error(error);
	}
	return data;
}
  
async function getAll() {
	let data = []
	try {
	  data = await PythonTemplate.find()
	} catch (error) {
	  throw new Error(error)
	}
	return data
}

async function deletePythonTemplate(id) {
	let data = [];
	try {
	  data = await PythonTemplate.deleteOne({ _id: id })
	} catch (error) {
	  throw new Error(error);
	}
	return data;
}

async function createPythonTemplate(query) {
	let data = null;

	try {
		data = await new PythonTemplate(query).save();
	} catch (error) {
		throw new Error(error);
	}

	return data;
}

async function updatePythonTemplate(id, query) {
	let data = null;

	try {
		data = await PythonTemplate.findOneAndUpdate({ _id: id}, { $set: query }, { new: true });
		if (!data) {
			throw new Error('Not exist');
		}
	} catch (error) {
		throw new Error(error);
	}
	return data;
}

function getZIPTemplate(query) {
	
	let folderName = '';

	try {
		console.log(query);
		
		folderName = createFilesForZIP(query);
		
	} catch (error) {
		throw new Error(error);
	}
	return folderName;

}