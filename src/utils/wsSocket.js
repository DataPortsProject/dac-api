import logger from '../config/winston';
import config from './variables';

const { Server } = require('ws');
const { createServer } = require('https');
const { readFileSync } = require('fs');

// eslint-disable-next-line import/prefer-default-export
export class WsSocket {
  constructor(portValue) {
    const options = {};
    if (
      process.env.INSECURE_WS !== undefined ||
      process.env.INSECURE_WS === 'false'
    ) {
      const serverOpts = {
        key: readFileSync(config.SSL_PRIV_KEY),
        cert: readFileSync(config.SSL_CERT_FILE),
      };
      if (config.SSL_CA_CERT) {
        serverOpts.ca = readFileSync(config.SSL_CA_CERT);
      }
      const server = createServer(serverOpts);
      options.server = server;
      server.listen(portValue);
    } else {
      options.port = portValue;
    }
    const wss = new Server(options);
    wss.on('connection', (ws) => {
      logger.debug(
        `New connection opened. Available clients: ${wss.clients.size}`
      );
      ws.on('message', (message) => {
        logger.info(`Received message => ${message}`);
      });
      ws.on('error', (_ws, err) => {
        logger.error(err);
      });
      ws.on('close', () => {
        logger.debug(
          `A listener disconnected. Remaining listeners: ${wss.clients.size}`
        );
      });
      ws.send('Connection opened!!');
    });
    wss.on('error', (err) => logger.error(err));
    this.socket = wss;
  }

  broadcast(message) {
    logger.debug(`Broadcast notification to ${this.socket.clients.size} clients`);
    this.socket.clients.forEach((client) => client.send(message));
  }
}
