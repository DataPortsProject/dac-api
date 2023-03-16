import DataModelObject from '../models/DataModelObject.model';

import { getProjects, getJson } from '../api/gitlab_API';

import logger from '../config/winston';

// Implementation
export async function getAll() {
  return DataModelObject.find()
    .exec()
    .catch((error) => {
      logger.error(error.toString());
      throw new Error(error);
    });
}

export async function createDataModelAssigment(query) {
  return new DataModelObject(query).save().catch((error) => {
    throw new Error(error);
  });
}

export function deleteDataModel(id) {
  return DataModelObject.deleteOne({ _id: id })
    .exec()
    .catch((error) => {
      throw new Error(error);
    });
}

export async function updateDataModel(id, query) {
  let data = null;

  try {
    data = await DataModelObject.findOneAndUpdate(
      { _id: id },
      { $set: query },
      { new: true }
    ).exec();
    if (!data) {
      throw new Error('Not exist');
    }
  } catch (error) {
    logger.error(error.toString());
    throw new Error(error);
  }
}

export async function getJsonSchema(properties) {
  let projects = null;

  try {
    const path = properties.link;
    return await getProjects().then((response) => {
      projects = response;
      let ID = null;
      projects.forEach((element) => {
        if (element.name === properties.projectName) {
          ID = element.id;
        }
      });
      const pathUpdated = path.replace('/', '%2F');
      const pathUpdatedV2 = pathUpdated.replace('/', '%2F');
      const url = `/api/v4/projects/${ID}/repository/files/${pathUpdatedV2}/raw`;
      return getJson(url);
    });
  } catch (error) {
    logger.error(error.toString());
    throw new Error(error);
  }
}
