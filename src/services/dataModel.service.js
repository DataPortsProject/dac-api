import DataModelObject from '../models/DataModelObject.model';

import { getProjects, getJson } from '../api/gitlab_API';

const service = {};

service.getAll = getAll;
service.createDataModel_Assigment = createDataModel_Assigment;
service.deleteDataModel = deleteDataModel;
service.updateDataModel = updateDataModel;
service.getJsonSchema = getJsonSchema;

export default service;

// Implementation
async function getAll() {
	let data = [];
	try {
		data = await DataModelObject.find();
	} catch (error) {
		throw new Error(error);
	}
	return data;
}

async function createDataModel_Assigment(query) {
	let data = null;

	try {
		data = await new DataModelObject(query).save();
	} catch (error) {
		throw new Error(error);
	}

	return data;
}

async function deleteDataModel(id) {
	let data = [];
	try {
		data = await DataModelObject.deleteOne({ _id: id });
	} catch (error) {
		throw new Error(error);
	}
	return data;
}

async function updateDataModel(id, query) {
	let data = null;

	console.log('SERVICE');
	console.log('id', id);

	try {
		data = await DataModelObject.findOneAndUpdate({ _id: id }, { $set: query }, { new: true });
		if (!data) {
			throw new Error('Not exist');
		}
	} catch (error) {
		console.log('ERROR');
		console.log(error);
		throw new Error(error);
	}
	return data;
}

async function getJsonSchema(properties) {
	let projects = null;
	let data = null;

	try {
		const path = properties.link;
		console.log('SERVICIO');
		console.log(path);
		await getProjects().then(response => {
			// console.log(response);
			projects = response;
			let ID = null;
			projects.forEach(element => {
				if (element.name === properties.projectName) {
					ID = element.id;
				}
			});
			// console.log(ID);
			const path_updated = path.replace('/', '%2F');
			const url = `/api/v4/projects/${ID}/repository/files/${path_updated}/raw`;
			data = getJson(url);
		});
	} catch (error) {
		throw new Error(error);
	}
	return data;
}
