import Mongoose from 'mongoose';
import config from './config';
import logger from './winston';

Mongoose.Promise = global.Promise;

const connectToDb = async () => {
  try {
    await Mongoose.connect(config.mongodb.URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });

    logger.info('Connected to MongoDB');
  } catch (err) {
    logger.error('Could not connect to MongoDB');
  }
};

export default connectToDb;
