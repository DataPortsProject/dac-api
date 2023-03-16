import axios from 'axios';

import logger from '../config/winston';
import variables from '../utils/variables';

export default getKeyCloakToken;

export async function getKeyCloakToken(user, pass) {
  const params = new URLSearchParams({
    client_id: 'DataAccess',
    client_secret: 'ydA5pw32n2UFdqrCFhx5K6nsvyFUlPBg',
    grant_type: 'password',
    username: user,
    password: pass,
  });

  return axios({
    method: 'POST',
    url: `${variables.KEYCLOAK_URL}/auth/realms/DataPorts/protocol/openid-connect/token`,
    data: params.toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
    .then((response) => {
      logger.debug(`Response from IAM: ${JSON.stringify(response.data)}`);
      return response.data.access_token;
    })
    .catch((error) => {
      logger.error(error.toString());
      throw error;
    });
}

export async function getUserInfo(token) {
  return axios({
    method: 'GET',
    url: `${variables.KEYCLOAK_URL}/auth/realms/DataPorts/protocol/openind-connect/userinfo`,
    headers: {
      Authentication: `Bearer ${token}`,
    },
  });
}
