import {
  createContainerFromImage,
  startContainerCreated,
} from '../api/docker_API';
import CustomError from '../utils/CustomError';
import { responseContainerObject } from '../utils/Mapping';

// Implementation
// eslint-disable-next-line import/prefer-default-export
export async function createContainer(name, query) {
  try {
    await createContainerFromImage(name, query)
      .then(
        (response) => startContainer(response.Id),
        (error) => error.response.data.message
      )
      .then((containerData) => responseContainerObject(containerData));
  } catch (error) {
    throw new CustomError(error.response.data, error.response.status);
  }
}

async function startContainer(id) {
  return startContainerCreated(id).catch((error) => {
    throw new CustomError(error.response.data, error.response.status);
  });
}
