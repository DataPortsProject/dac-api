export default {
  // *************************
  // las diferentes URLs deben pasarse a través de entorno, bien a través de un .env o a través
  // del docker-compose.
  // Intentemos no modificar este archivo para cada despliegue que al final es un follón llevar
  // un control de la configuración de cada servidor
  // *************************
  // para despliegues (Windows)
  // local_DOCKER_API: 'http://host.docker.internal:2375',
  // para despliegues (Linux)
  // local_DOCKER_API: process.env.DOCKER_API || 'http://172.17.0.1:2375',
  // para desarrollo en local
  LOCAL_DOCKER_API: process.env.DOCKER_API || 'http://localhost:2375',
  // URL Orion UPV
  // baseURL_ORION_UPV: 'http://158.42.188.129:8080',
  URL_ORION_UPV: process.env.ORION_URL || 'http://localhost:1026',
  // baseURL_ORION_LOCAL: 'http://45.94.58.194:1026',
  URL_CYGNUS: process.env.CYGNUS_URL || 'http://localhost:5055',
  // la siguiente URL es la IP publica de la máquina de ICCS
  // baseURL_CYGNUS: 'http://147.102.19.90:5055',
  URL_DAC_NOTIFY: process.env.NODERED_URL || 'http://localhost:8085',
  // image pattern name
  IMAGE_PATTERN_NAME: 'dataportsh2020/',
  GITLAB_IMAGE_PATTERN_NAME: 'egitlab.iti.es:5050/ivela/images',
  // methods petition API
  METHOD_GET: 'GET',
  METHOD_POST: 'POST',
  METHOD_PUT: 'PUT',
  METHOD_DELETE: 'DELETE',
  // attributes for petitions
  APPLICATION_JSON: 'application/json',
  METADATA_HEADER: 'metadata',
  // HTTP STATUS CODE
  INTERNAL_SERVER_ERROR: 500,
  // CORRECT_REQUEST: 200,
  NOT_FOUND: 404,
  // keycloak url
  KEYCLOAK_URL: process.env.KEYCLOAK_URL || 'https://iam.dataports.com.es:8443',
  // PERICO_URL: 'https://perico1.dcom.upv.es:8080',
  // ENV VARIABLES NOT INCLUDED
  ENV_VARIABLES_NOT_ALLOWED: [
    'PATH',
    'LANG',
    'GPG_KEY',
    'PYTHON_VERSION',
    'PYTHON_PIP_VERSION',
    'PYTHON_GET_PIP_URL',
    'PYTHON_GET_PIP_SHA256',
  ],
  gitlab_url: 'http://egitlab.iti.upv.es',
  gitlab_token: 'glpat-LFqfBGCyGYxzwP_nLBkL',
  gitlab_images_token: 'RWyBsqSXzxBVZZdhFenm',
  gitlab_login_string:
    'docker login -u ivela -p RWyBsqSXzxBVZZdhFenm egitlab.iti.es:5050',
  SSL_CERT_FILE: process.env.SSL_CERT_FILE || '/etc/ssl/certs/cert.crt',
  SSL_PRIV_KEY: process.env.SSL_CERT_KEY || '/etc/ssl/certs/cert.key',
  SSL_CA_CERT: process.env.SSL_CA_CERT || undefined,
};
