import express from 'express';
import { check } from 'express-validator';
/* import {
  createReadStream,
  exists,
  existsSync,
  lstatSync,
  mkdir,
  readdirSync,
  readFile,
  rmdirSync,
  unlinkSync,
  writeFile,
} from 'fs'; */

import {
  createReadStream,
  existsSync,
  mkdir,
  readFile,
  rmSync,
  writeFile,
} from 'fs';

import logger from '../config/winston';
import * as pythonTemplateService from '../services/pythonTemplate.service';

import { sendValidations } from '../middlewares/util';

import CustomError from '../utils/CustomError';

import { randomString } from '../utils/random';
// eslint-disable-next-line
import { constructPythonTemplate, updateTemplate } from '../utils/Mapping';

const AdmZip = require('adm-zip');

// eslint-disable-next-line import/prefer-default-export
export const router = express.Router();

// routes
router.get('/', getAll);
router.get('/:id', getPythonTemplate);
router.post(
  '/',
  [
    check('source').isIn([
      'agent-api',
      'agent-local-txt',
      'agent-local-excel',
      'agent-mqtt-listener',
      'agent-api-listener',
      'agent-rabbitMQ-listener',
    ]),
    check('type').isIn(['publish-subscribe', 'on-demand']),
  ],
  sendValidations,
  createPythonTemplate
);
router.delete('/:id', deletePythonTemplate);
router.put(
  '/:id',
  [
    check('source').isIn([
      'agent-api',
      'agent-local-txt',
      'agent-local-excel',
      'agent-mqtt-listener',
      'agent-api-listener',
      'agent-rabbitMQ-listener',
    ]),
    check('type').isIn(['publish-subscribe', 'on-demand']),
  ],
  sendValidations,
  updatePythonTemplate
);
router.post('/getZIPTemplate', getZIPTemplate);

// Implementación
async function getPythonTemplate(req, res) {
  const { params: { id } = { id: null } } = req;

  try {
    const data = await pythonTemplateService.getPythonTemplate(id);
    res.status(200).json({
      status: 'OK',
      message: data,
    });
  } catch (error) {
    logger.error(error.toString());
    if (error instanceof CustomError) {
      const { message, name, type } = error;
      return res.status(type).json({
        status: name,
        message: message.message,
      });
    }
    return res.status(404).json({
      status: 'Error',
      message: 'An error ocurred',
    });
  }
  return null;
}

async function getAll(req, res) {
  try {
    const data = await pythonTemplateService.getAll();
    return res.status(200).json({
      status: 'OK',
      message: data,
    });
  } catch (error) {
    logger.error(error.toString());
    if (error instanceof CustomError) {
      const { message, name, type } = error;
      return res.status(type).json({
        status: name,
        message: message.message,
      });
    }
    return res.status(404).json({
      status: 'Error',
      message: 'An error ocurred',
    });
  }
}

async function deletePythonTemplate(req, res) {
  const { params: { id } = { id: null } } = req;

  try {
    const data = await pythonTemplateService.deletePythonTemplate(id);
    res.status(200).json({
      status: 'OK',
      message: data,
    });
  } catch (error) {
    logger.error(error.toString());
    if (error instanceof CustomError) {
      const { message, name, type } = error;
      return res.status(type).json({
        status: name,
        message: message.message,
      });
    }
    return res.status(404).json({
      status: 'Error',
      message: 'An error ocurred',
    });
  }
  return null;
}

async function createPythonTemplate(req, res) {
  const template = constructPythonTemplate(req.body);

  try {
    const data = await pythonTemplateService.createPythonTemplate(template);
    res.status(200).json({
      status: 'OK',
      message: data,
    });
  } catch (error) {
    logger.error(error.toString());
    if (error instanceof CustomError) {
      const { message, name, type } = error;
      return res.status(type).json({
        status: name,
        message: message.message,
      });
    }
    return res.status(404).json({
      status: 'Error',
      message: 'An error occurred',
    });
  }
  return null;
}

async function updatePythonTemplate(req, res) {
  const { params: { id } = { id: null } } = req;
  const template = updateTemplate(req.body);

  try {
    const data = pythonTemplateService.updatePythonTemplate(id, template);
    res.status(200).json({
      status: 'OK',
      message: data,
    });
  } catch (error) {
    logger.error(error.toString());
    if (error instanceof CustomError) {
      const { message, name, type } = error;
      return res.status(type).json({
        status: name,
        message: message.message,
      });
    }
    return res.status(404).json({
      status: 'Error',
      message: 'An error occurred',
    });
  }
  return null;
}

async function getZIPTemplate(req, res) {
  let folderName = '';
  let query = null;

  try {
    query = req.body;

    folderName = Date.now();

    const folderDirectory = `./src/zips/${folderName}`;
    // -- Create folder --
    mkdir(folderDirectory, { recursive: true }, (err) => {
      if (err) throw err;
    });

    await readFromFile(query.constants, 'CONSTANTS', query, folderDirectory);
    await readFromFile(query.script, 'SCRIPT', query, folderDirectory);
    await readFromFile(query.dockerFile, 'DOCKERFILE', query, folderDirectory);

    logger.debug('Agrego ficheros al ZIP');

    const zip = new AdmZip();
    zip.addLocalFile(`./src/zips/${folderName}/constants.py`);
    zip.addLocalFile(`./src/zips/${folderName}/script.py`);
    zip.addLocalFile(`./src/zips/${folderName}/Dockerfile`);

    zip.addLocalFile('./src/templates/Readme.txt');

    if (query.constants.includes('agent-mqtt-subscribe')) {
      zip.addLocalFile('./src/templates/requirements.txt');
    }

    const downloadName = `${Date.now()}.zip`;

    zip.writeZip(`./src/zips/${folderName}/${downloadName}`);

    const filePath = `./src/zips/${folderName}/${downloadName}`;

    if (existsSync(filePath)) {
      res.writeHead(200, {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename=${downloadName}`,
      });
      createReadStream(filePath).pipe(res);
      // Delete the zip folder and their content
      setTimeout(() => {
        deleteFolderRecursive(`./src/zips/${folderName}`);
        logger.debug(`Borramos el directorio ${folderName}`);
      }, 4 * 1000);
    } else {
      res.writeHead(400, {
        'Content-Type': 'text/plain',
      });
      res.end('Error file does not exist');
    }
  } catch (error) {
    logger.error(error.toString());
    if (error instanceof CustomError) {
      const { type } = error;
      return res.status(type).json({
        status: 'Error',
        message: 'An error occurred',
      });
    }
  }
  return null;
}

// Function to complete getZIPTemplate!!
function readFromFile(file, fileType, query, folderDirectory) {
  let directory = '';
  let randomStr = '';
  if (new Date().getMinutes() % 2) {
    randomStr = randomString(32, '#aA');
  } else {
    randomStr = randomString(64, '#A!');
  }

  logger.debug(`Reading file ${file} with type ${fileType}`);

  return new Promise((resolve, reject) => {
    readFile(file, 'utf8', (err, data) => {
      if (err) {
        logger.error(err.toString());
        reject(err);
      } else {
        let dataModelProperties = '';
        let processedData = data;
        if (fileType === 'CONSTANTS') {
          const fileUpdated = data.replace(
            /parameter_timeInterval/gim,
            query.time_interval
          );
          const timeUnitNewValue = fileUpdated.replace(
            /parameter_timeUnit/gim,
            `"${query.time_unit}"`
          );

          const callbackParameter = timeUnitNewValue.replace(
            /parameter_CallbackURL/gim,
            `"${query.callback_url}"`
          );

          const randomIDParameter = callbackParameter.replace(
            /parameter_random/gim,
            `"${randomStr}"`
          );

          const isPublic = query.isPrivateRepository_dataModel
            ? 'True'
            : 'False';

          const isPrivateRepositoryParameter = randomIDParameter.replace(
            /parameter_isPrivateRepository/gim,
            isPublic
          );

          const urlPublicRepositoryParameter =
            isPrivateRepositoryParameter.replace(
              /parameter_urlPublicRepository/gim,
              `"${query.urlPublicDataModel}"`
            );

          const projectNamePrivateRepositoryParameter =
            urlPublicRepositoryParameter.replace(
              /parameter_projectNamePrivateRepository/gim,
              `"${query.dataForPrivateRepository.projectName}"`
            );

          const linkPrivateRepositoryParameter =
            projectNamePrivateRepositoryParameter.replace(
              /parameter_linkPrivateRepository/gim,
              `"${query.dataForPrivateRepository.link}"`
            );

          directory = `${folderDirectory}/constants.py`;

          writeFile(
            directory,
            linkPrivateRepositoryParameter,
            'utf-8',
            (_err) => {
              if (_err) {
                reject(_err);
              } else {
                logger.info('Done! Constants');
                resolve();
              }
            }
          );
        }
        if (fileType === 'SCRIPT') {
          // create data model properties
          dataModelProperties = query.fieldsUsed_DataModel
            .map((prop) => `m.add("${prop.id}", ##add value here##)`)
            .join('\n');

          processedData = data
            .replace(/parameter_urlAPI/gim, query.url_api)
            .replace(/parameter_urlORION/gim, query.orion_url)
            .replace(/parameter_orionPORT/gim, query.orion_port)
            .replace(/parameter_dataProvider/gim, query.data_provider)
            .replace(/parameter_dataModel/gim, dataModelProperties)
            .replace(/parameter_TypeDataModel/gim, query.dataModelType)
            .replace(/parameter_filePath/gim, query.filepath)
            .replace(/parameter_fileName/gim, query.filename)
            .replace(/parameter_mqttHost/gim, query.mqtt_host)
            .replace(/parameter_mqttPort/gim, query.mqtt_port)
            .replace(/parameter_mqttTopic/gim, query.mqtt_topic)
            .replace(/parameter_rabbit_queue/gim, query.rabbitmq_queue)
            .replace(/parameter_rabbit_user/gim, query.rabbitmq_user)
            .replace(/parameter_rabbit_password/gim, query.rabbitmq_password)
            .replace(/parameter_rabbit_server/gim, query.rabbitmq_host)
            .replace(/parameter_rabbit_port/gim, query.rabbitmq_port);

          directory = `${folderDirectory}/script.py`;

          /* Object.keys(query).forEach((key) => {
            const value = query[key];
            processedData = processedData.replace(
              new RegExp(`\\\${pythonTemplate\\.data\\.${key}}`, 'gim'),
              value
            );
          });

          processedData = processedData.replace(
            /\${pythonTemplate\.data\.dataModelProperties}/gim,
            dataModelProperties
          ); */

          writeFile(directory, processedData, 'utf-8', (_err) => {
            if (_err) {
              reject(_err);
            } else {
              logger.info('Done Script!');
              resolve();
            }
          });

          /* writeFile(directory, rabbitmqPortParameter, 'utf-8', (_err) => {
            if (_err) throw _err;
            logger.info('Done Script!');
          }); */
        }
        if (fileType === 'DOCKERFILE') {
          const dockerFile = data
            .replace(/parameter_timeInterval/gim, query.time_interval)
            .replace(/parameter_timeUnit/gim, `"${query.time_unit}"`)
            .replace(/parameter_CallbackURL/gim, `"${query.callback_url}"`)
            .replace(/parameter_random/gim, `"${randomStr}"`)
            .replace(/parameter_dataModelSerialized/gim,
              JSON.stringify(query.dataSourceSerialized)
            );

          directory = `${folderDirectory}/Dockerfile`;

          writeFile(directory, dockerFile, 'utf-8', (_err) => {
            if (_err) {
              reject(_err);
            } else {
              logger.info('Done Dockerfile!');
              resolve();
            }
          });
        }
      }
    });
  });
}

function deleteFolderRecursive(path) {
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
  }
}
