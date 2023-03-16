import winston from 'winston';
import path from 'path';
import fs from 'fs';
import config from './config';

if (process.env.NODE_ENV === 'production') {
  const logDir = config.LOGS_DIR;
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  const files = new winston.transports.File({
    level: 'warn',
    filename: path.join(logDir, '/api-logs.log'),
    handleExceptions: true,
    maxsize: 536870912, // 512MB
    maxFiles: 5,
    colorize: false,
  });
  winston.add(files);
}
const alignedWithColorsAndTime = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level}]: ${info.message}`
  )
);

const console = new winston.transports.Console({
  level: 'debug',
  handleExceptions: true,
  format: alignedWithColorsAndTime,
  colorize: true,
});
winston.add(console);

export default winston;
