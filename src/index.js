import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import logger from './config/winston';
import config from './config/config';
import util from './middlewares/util';
import auth from './middlewares/auth';

import onDemand from './controllers/on_demand.controller';
// import pubsub from './controllers/pubsub.controller';

import images from './controllers/images.controller';
import agents from './controllers/agents.controller';
import orion from './controllers/orion.controller';
import template from './controllers/pythonTemplate.controller';
import dataModel from './controllers/dataModel.controller';

import connectToDb from './config/mongodb';

connectToDb();

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const checkContainers = require('./bg_process/process');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(util.languageParser);
app.use(cors());

// Routes
app.use('/on_demand', auth.authUser, auth.isAuthorized, onDemand);

app.use('/images', auth.authUser, auth.isAuthorized, images);
app.use('/agents', auth.authUser, auth.isAuthorized, agents);
app.use('/orion', auth.authUser, auth.isAuthorized, orion);
app.use('/pythonTemplate', auth.authUser, auth.isAuthorized, template);
app.use('/dataModel', auth.authUser, auth.isAuthorized, dataModel);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));

// Proceso en background para el borrado de contenedores on_demand. Se ejecuta cada 10 minutos
setInterval(checkContainers, 600 * 1000);

app.listen(config.PORT, () => logger.info(`Listen on ${config.PORT} port`));
