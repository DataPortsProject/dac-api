import OnDemand from '../models/OnDemand.model';
import { createContainerFromImage, startContainerCreated } from '../api/docker_API'
import { responseContainerObject } from '../utils/Mapping';

const service = {};

service.createContainer = createContainer;

export default service;

// Implementation
async function createContainer(name, query) {
  let container_data = null;
  let data = null;
  try {
    await createContainerFromImage(name, query).then(response => {
      container_data = startContainer(response.Id)
      data = responseContainerObject(container_data)
    },
    error => {
      data = error.response.data.message;
    });
  } catch (error) {
    throw new CustomError(error.response.data, error.response.status);
  }
  return data;
}

async function startContainer(ID) {
  let data = null;

  try{
    data = await startContainerCreated(ID);
  } catch (error) {
    throw new CustomError(error.response.data, error.response.status);
  }
  return data;
}
