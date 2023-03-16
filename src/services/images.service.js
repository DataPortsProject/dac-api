import {
  getImages,
  inspectImageById,
  deleteImageByID,
} from '../api/docker_API';
import { getRepositoryImages } from '../api/gitlab_API';
import { doLogin, downloadImage } from '../api/cmd';
import CustomError from '../utils/CustomError';
import {
  createImagesObj,
  createTemplateObj,
  createDataSourceObject,
} from '../utils/Mapping';

import logger from '../config/winston';

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
  logger.info('Retrieving all docker images');
  try {
    return createImagesObj(await getImages());
  } catch (error) {
    logger.error(`Failed retrieving docker images:  ${error.toString()}`);
    if (error.isAxiosError) {
      if (error.response !== undefined) {
        throw new CustomError(error.response.data, error.response.status);
      } else {
        throw new CustomError(
          { message: { reason: error.code, context: error.message } },
          500,
          'Internal Server Error'
        );
      }
    }
    throw new CustomError(error.response.data, error.response.status);
  }
}

async function getDataSource(id) {
  try {
    const imageInfo = await inspectImageById(id);
    return createDataSourceObject(imageInfo);
  } catch (error) {
    logger.error(`Failed retrieving datasource with id ${id}:`);
    throw new CustomError(error.response.data, error.response.status);
  }
}

async function getTemplate(id) {
  try {
    const imageInfo = await inspectImageById(id);
    return createTemplateObj(imageInfo);
  } catch (error) {
    throw new CustomError(error.response.data, error.response.status);
  }
}

async function deleteImage(id) {
  try {
    return await deleteImageByID(id);
  } catch (error) {
    throw new CustomError(error.response.data, error.response.status);
  }
}

// Request para traerse las imagenes del gitlab de dataports
async function getImagesFromExternalRepository(body) {
  try {
    return await getRepositoryImages(body);
  } catch (error) {
    throw new CustomError(error.response.data, error.response.status);
  }
}

async function downloadImageFromGitlab(body) {
  try {
    await doLogin(body);
    await downloadImage(body.path);
    return {
      msg: 'image pulled successfully!',
      image: body.path,
    };
  } catch (error) {
    throw new CustomError(error.response.data, error.response.status);
  }
}
