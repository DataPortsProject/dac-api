const stat = require('fs').statSync;
const AdmZip = require('adm-zip');
const fs = require('fs');

module.exports.sleep = function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

module.exports.newZIP = function newZIP(zipFileName, pathNames) {
  const zip = new AdmZip();

  pathNames.forEach((path) => {
    const p = stat(path);
    if (p.isFile()) {
      zip.addLocalFile(path);
    } else if (p.isDirectory()) {
      zip.addLocalFolder(path, path);
    }
  });

  zip.writeZip(zipFileName);
};

module.exports.createFilesForZIP = function createFilesForZIP(query) {
  let directory = '';
  let folderName = '';

  folderName = Date.now();

  const folderDirectory = `./src/zips/${folderName}`;
  // -- Create folder --
  fs.mkdir(folderDirectory, { recursive: true }, (err) => {
    if (err) throw err;
  });

  // -- Create new constants file based on the basic
  fs.readFile(query.constants, 'utf8', (_err, data) => {
    // data es el contenido del fichero
    if (_err) throw _err;

    const fileUpdated = data.replace(
      /parameter_timeInterval/gim,
      query.time_interval
    );
    const timeUnitNewValue = fileUpdated.replace(
      /parameter_timeUnit/gim,
      `"${query.time_unit}"`
    );

    directory = `${folderDirectory}/constants.py`;

    fs.writeFile(directory, timeUnitNewValue, 'utf-8', (err) => {
      if (err) throw err;
    });
  });

  // -- Create new script file based on the basic
  fs.readFile(query.script, 'utf8', (_err, data) => {
    // data es el contenido del fichero
    if (_err) throw _err;
    const urlParameter = data.replace(/parameter_urlAPI/gim, query.url_api);
    const orionUrlParameter = urlParameter.replace(
      /parameter_urlORION/gim,
      query.orion_url
    );
    const orionPortParameter = orionUrlParameter.replace(
      /parameter_orionPORT/gim,
      query.orion_port
    );
    const dataProviderParameter = orionPortParameter.replace(
      /parameter_dataProvider/gim,
      query.data_provider
    );

    directory = `${folderDirectory}/script.py`;

    fs.writeFile(directory, dataProviderParameter, 'utf-8', (err) => {
      if (err) throw err;
    });
  });

  // -- Create new Dockerfile based on the basic
  fs.readFile(query.dockerFile, 'utf8', (_err, data) => {
    // data es el contenido del fichero
    if (_err) throw _err;
    const fileUpdated = data.replace(
      /parameter_timeInterval/gim,
      query.time_interval
    );
    const timeUnitNewValue = fileUpdated.replace(
      /parameter_timeUnit/gim,
      `"${query.time_unit}"`
    );

    directory = `${folderDirectory}/Dockerfile`;

    fs.writeFile(directory, timeUnitNewValue, 'utf-8', (err) => {
      if (err) throw err;
    });
  });

  return folderName;
};
