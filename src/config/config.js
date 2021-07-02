const config = {};
/* const fs = require('fs'); 
var ADMIN_SECRET_FILE = null
try {
 ADMIN_SECRET_FILE = fs.readFileSync(process.env.ADMIN_SECRET_FILE, {encoding:'utf8', flag:'r'}); 
} catch (error) {
  console.warn("ENV ADMIN_SECRET_FILE not found, getting ADMIN_SECRET_STRING or default value now...")
}
*/
config.LOGS_DIR = process.env.LOGS_DIR || 'logs';
config.PORT = process.env.PORT || 3000;

/**
 * MongoDB
 */

config.mongodb = {};
config.mongodb.URL = process.env.MONGO_URL || 'mongodb://localhost:27017/dataports-db'; // url para local
// config.mongodb.URL = process.env.MONGO_URL || 'mongodb://mongo/dataports-db'; // url para desplegar con docker-compose

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
