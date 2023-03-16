import logger from '../config/winston';

const { exec } = require('child_process');

export function doLogin(body) {
  return new Promise((resolve) => {
    exec(
      `docker login -u ${body.user} -p ${body.accessToken} ${body.repositoryUrl}`,
      { maxBuffer: 1024 * 500 },
      (error, stdout, stderr) => {
        if (error) {
          logger.warn(error);
        } else if (stdout) {
          logger.log(stdout);
        } else {
          logger.log(stderr);
        }
        resolve(!!stdout);
      }
    );
  });
}

export function downloadImage(path) {
  return new Promise((resolve) => {
    exec(
      `docker pull ${path}`,
      { maxBuffer: 1024 * 500 },
      (error, stdout, stderr) => {
        if (error) {
          logger.warn(error);
        } else if (stdout) {
          logger.log(stdout);
        } else {
          logger.log(stderr);
        }
        resolve(!!stdout);
      }
    );
  });
}
