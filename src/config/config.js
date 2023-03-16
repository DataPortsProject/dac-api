const config = {};

config.LOGS_DIR = process.env.LOGS_DIR || 'logs';
config.PORT = process.env.PORT || 3000;

/**
 * MongoDB
 */
config.mongodb = {};
config.mongodb.URL =
  process.env.MONGO_URL || 'mongodb://localhost:27017/dataports-db'; // url para local

/**
 * General Configuration
 */
config.const = {};

/**
 * Master Token
 */
config.auth = {};
config.auth.master = process.env.API_MASTER || 'alerts123456789';

config.const.LANG = ['en-US', 'es-ES'];

export default config;
