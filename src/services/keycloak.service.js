/* eslint-disable */
import { getKeyCloakToken } from '../api/keycloak';

// Crea un agente y lo arranca
export async function getToken(body) {
  const username = body.username;
  const password = body.password;

  return getKeyCloakToken(username, password).catch((error) => {
    console.log(error);
    throw new CustomError(error.response.data, error.response.status);
  });
}
