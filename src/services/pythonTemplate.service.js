import PythonTemplate from '../models/PythonTemplate.model';

import logger from '../config/winston';

import { createFilesForZIP } from '../utils/utilities';

// Implementation
export async function getPythonTemplate(id) {
  return PythonTemplate.findOne({ _id: id })
    .exec()
    .catch((error) => {
      throw new Error(error);
    });
}

export async function getAll() {
  return PythonTemplate.find({})
    .exec()
    .catch((error) => {
      throw new Error(error);
    });
}

export async function deletePythonTemplate(id) {
  return PythonTemplate.deleteOne({ _id: id })
    .exec()
    .catch((error) => {
      throw new Error(error);
    });
}

export async function createPythonTemplate(query) {
  return new PythonTemplate(query).save().catch((error) => {
    throw new Error(error);
  });
}

export function updatePythonTemplate(id, query) {
  let data = null;

  try {
    data = PythonTemplate.findOneAndUpdate(
      { _id: id },
      { $set: query },
      { new: true }
    ).exec();
    if (!data) {
      throw new Error('Not exist');
    }
    return data;
  } catch (error) {
    throw new Error(error);
  }
}

export function getZIPTemplate(query) {
  try {
    return createFilesForZIP(query);
  } catch (error) {
    logger.error(error.toString());
    throw new Error(error);
  }
}
