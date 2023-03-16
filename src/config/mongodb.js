import Mongoose from 'mongoose';
import config from './config';
import logger from './winston';

Mongoose.Promise = global.Promise;
Mongoose.set('strictQuery', true);

// eslint-disable-next-line import/prefer-default-export
export async function connectToDb() {
  try {
    logger.info(`Connecting to ${config.mongodb.URL}`);
    Mongoose.connect(config.mongodb.URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // these 2 properties were deprecated in earlier versions of mongoose
      // useCreateIndex: true,
      // useFindAndModify: false,
    });

    logger.info('Connected to MongoDB');
  } catch (err) {
    logger.error('Could not connect to MongoDB');
  }
}
