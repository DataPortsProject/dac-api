import axios from 'axios';
import variables from '../utils/variables';

// Implementation
export async function getTemplate() {
  return {
    env: ['env1=val', 'env2=val'],
    image: 'image_name',
    tag: 'latest',
    containername: 'container_name',
  };
}

export async function createContainer(query) {
  let data = {};
  const controller = `${variables.DOCKER_HOST}/containers/create?name=${query.containername}`;
  const params = constructDockerJson(query);

  await axios({
    method: 'post',
    url: controller,
    data: params,
  }).then(
    (response) => {
      data = response.data;
      startContainer(data);
    },
    (error) => {
      data.message = error.response.data.message;
    }
  );
  data.containerName = query.containername;
  return data;
}

export async function stopContainer(query) {
  let data = {};
  const controller = `${variables.DOCKER_HOST}/containers/${query.Id}/stop`;
  const params = {};

  await axios({
    method: 'post',
    url: controller,
    data: params,
  }).then(
    () => {
      data = `Container ${query.Id} stopped successfully!`;
    },
    (error) => {
      data.name = error.name;
      data.message = error.message;
    }
  );

  return data;
}

export async function startContainer(query) {
  let data = {};
  const controller = `${variables.DOCKER_HOST}/containers/${query.Id}/start`;
  const params = {};

  await axios({
    method: 'post',
    url: controller,
    data: params,
  }).then(
    () => {
      data = `Container ${query.Id} started successfully!`;
    },
    (error) => {
      data.name = error.name;
      data.message = error.message;
    }
  );

  return data;
}

// Funcion para crear un objeto valido para la creación de un contenedor en la api de docker
function constructDockerJson(data) {
  const dockerObject = {
    image: data.image,
    tag: data.tag ? data.tag : 'latest',
    env: [],
  };

  data.env.forEach((env) => {
    dockerObject.env.push(env);
  });

  return dockerObject;
}
