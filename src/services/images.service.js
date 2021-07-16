import { getImages, inspectImageByID, deleteImageByID } from '../api/docker_API';
import { getRepositoryImages } from '../api/gitlab_API';
import { doLogin, downloadImage } from '../api/cmd';
import CustomError from '../utils/CustomError';
import { createImagesObj, createTemplateObj, createDataSourceObject } from '../utils/Mapping';

const service = {};

service.getAll = getAll;
service.getTemplate = getTemplate;
service.getDataSource = getDataSource;
service.deleteImage = deleteImage;
service.getImagesFromExternalRepository = getImagesFromExternalRepository;
service.downloadImageFromGitlab = downloadImageFromGitlab;

export default service;

// Implementation
async function getAll() {
	let data = [];
	try {
		await getImages().then(response => {
			const imageData = response;
			data = createImagesObj(imageData);
		});
	} catch (error) {
		throw new CustomError(error.response.data, error.response.status);
	}
	return data;
}

async function getDataSource(ID) {
	let data = [];
	try {
		const imageInfo = await inspectImageByID(ID);
		data = createDataSourceObject(imageInfo);
	} catch (error) {
		throw new CustomError(error.response.data, error.response.status);
	}
	return data;
}

async function getTemplate(ID) {
	let data = [];
	try {
		const imageInfo = await inspectImageByID(ID);
		data = createTemplateObj(imageInfo);
	} catch (error) {
		throw new CustomError(error.response.data, error.response.status);
	}
	return data;
}

async function deleteImage(id) {
	let data = [];
	try {
		data = await deleteImageByID(id);
	} catch (error) {
		throw new CustomError(error.response.data, error.response.status);
	}
	return data;
}

// Request para traerse las imagenes del gitlab de dataports
async function getImagesFromExternalRepository() {
	let data = [];
	try {
		await getRepositoryImages().then(response => {
			data = response;
		});
	} catch (error) {
		throw new CustomError(error.response.data, error.response.status);
	}
	return data;
}

async function downloadImageFromGitlab(path) {
	let data = [];
	try {
		await doLogin();
		await downloadImage(path);
		data = {
			msg: 'image pulled successfully!',
			image: path
		};
	} catch (error) {
		throw new CustomError(error.response.data, error.response.status);
	}
	return data;
}
