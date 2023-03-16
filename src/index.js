import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import promBundle from 'express-prom-bundle';
import swStats from 'swagger-stats';

import logger from './config/winston';
import config from './config/config';
import { languageParser } from './middlewares/util';
import { isAuthorized, authUser } from './middlewares/auth';

import { router as onDemand } from './controllers/on_demand.controller';
import { router as images } from './controllers/images.controller';
import { router as agents } from './controllers/agents.controller';
import { router as orion } from './controllers/orion.controller';
import { router as template } from './controllers/pythonTemplate.controller';
import { router as dataModel } from './controllers/dataModel.controller';
import { router as notification } from './controllers/notification.controller';
import { router as info } from './controllers/info.controller';
import { router as cygnus } from './controllers/cygnus.controller';
import { router as infoToCygnus } from './controllers/infoToCygnus.controller';
import { router as keycloak } from './controllers/keycloak.controller';

import { connectToDb } from './config/mongodb';
import { checkContainers } from './bg_process/process';

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const metricsSummaryMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  metricType: 'summary',
  promClient: {
    collectDefaultMetrics: {},
  },
  customLabels: {
    date: null,
    source: 'api',
  },
  transformLabels: (labels) =>
    Object.assign(labels, { date: new Date().toISOString().split('T')[0] }),
});
const metricsHistogramMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeUp: false,
  httpDurationMetricName: 'http_request_duration_seconds2',
  customLabels: {
    date: null,
  },
  transformLabels: (labels) =>
    Object.assign(labels, { date: new Date().toISOString().split('T')[0] }),
});

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line global-require
  const variables = require('./utils/variables');
  const varsToPrint = {};
  Object.keys(variables.default)
    .filter((key) => !key.toLowerCase().startsWith('gitlab'))
    .forEach((key) => {
      varsToPrint[key] = variables.default[key];
    });
  logger.debug(
    `Bootstraping API with config:\n${JSON.stringify(varsToPrint, null, 2)}`
  );
}

connectToDb();

const app = express();
if (process.env.ENABLE_CORS === 'true') {
  app.use(
    cors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204,
    })
  );
}
app.use(metricsSummaryMiddleware);
app.use(metricsHistogramMiddleware);
app.use(swStats.getMiddleware({ swaggerSpec: swaggerDocument }));
app.use(
  express.json({
    limit: '10mb',
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(languageParser);

// log all requests
app.use((req, _res, next) => {
  logger.info(
    `${req.ip || (req.ips !== undefined ? req.ips.join('/') : '')} ${req.method} ${req.originalUrl}`
  );
  next();
});

// Routes
app.use('/on_demand', authUser, isAuthorized, onDemand);

app.use('/images', authUser, isAuthorized, images);
app.use('/agents', authUser, isAuthorized, agents);
app.use('/orion', authUser, isAuthorized, orion);
app.use('/pythonTemplate', authUser, isAuthorized, template);
app.use('/dataModel', dataModel);
app.use('/notification', notification);
app.use('/info', info);
app.use('/cygnus', cygnus);
app.use('/cygnusInformation', infoToCygnus);
app.use('/keycloak', keycloak);

// Swagger description
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, { explorer: true })
);

app.all('*', (req, _res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.status = 'fail';
  err.statusCode = 404;

  next(err);
});

app.use((err, req, res, next) => {
  const error = err;
  error.statusCode = err.statusCode || 500;
  error.status = err.status || 'error';

  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
});

// Proceso en background para el borrado de contenedores on_demand. Se ejecuta cada 10 minutos
setInterval(() => {
  // checkContainers es asíncrona y setInterval no se lleva bien con callbacks asíncronos, por eso hacemos esto aquí
  (async () => {
    await checkContainers();
  })();
}, 600 * 1000);

app.listen(config.PORT, () => logger.info(`Listen on ${config.PORT} port`));
