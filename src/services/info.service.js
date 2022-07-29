import InfoModel from '../models/Info.model';

const service = {};

service.getOne = getOne;
service.getFiltered = getFiltered;
service.getAll = getAll;
service.create = create;
service.deleteInfo = deleteInfo;
service.deleteInfoByContainer = deleteInfoByContainer;

export default service;

// Implementation
async function getOne(id) {
	let data = [];
	try {
		data = await InfoModel.findOne({ random_id: id });
	} catch (error) {
		throw new Error(error);
	}
	return data;
}

async function getAll(query) {
	let data = [];
	try {
		data = InfoModel.find(query);
	} catch (error) {
		throw new Error(error);
	}
	return data;
}

async function deleteInfo(id) {
	let data = [];
	try {
		data = await InfoModel.deleteOne({ random_id: id });
	} catch (error) {
		throw new Error(error);
	}
	return data;
}

async function deleteInfoByContainer(containerName) {
	let data = [];
	try {
		data = await InfoModel.deleteOne({ container_name: containerName });
	} catch (error) {
		throw new Error(error);
	}
	return data;
}

async function create(query) {
	let data = null;
	try {
		data = await new InfoModel(query).save();
	} catch (error) {
		throw new Error(error);
	}
	return data;
}

async function getFiltered(id, interval, unit) {
	let data = [];
	try {
		data = await InfoModel.find({ random_id: id, time_interval: interval, time_unit: unit });
	} catch (error) {
		throw new Error(error);
	}
	return data;
}
