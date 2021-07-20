const stat = require('fs').statSync;
const AdmZip = require('adm-zip');
const fs = require('fs');

module.exports.sleep = function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports.newZIP = function newZIP(zipFileName, pathNames) {
	const zip = new AdmZip();

	pathNames.forEach(path => {
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
	console.log('Dentro de utilities');
	let directory = '';
	let folderName = '';

	folderName = Date.now();

	// console.log(folderName);
	const folderDirectory = `./src/zips/${folderName}`;
	// -- Create folder --
	fs.mkdir(folderDirectory, { recursive: true }, err => {
		if (err) throw err;
	});

	// -- Create new constants file based on the basic
	fs.readFile(query.constants, 'utf8', function(err, data) {
		// data es el contenido del fichero
		if (err) throw err;
		// console.log(data);

		const fileUpdated = data.replace(/parameter_timeInterval/gim, query.time_interval);
		const timeUnit_newValue = fileUpdated.replace(
			/parameter_timeUnit/gim,
			`"${query.time_unit}"`
		);

		directory = `${folderDirectory}/constants.py`;

		fs.writeFile(directory, timeUnit_newValue, 'utf-8', function(err, data) {
			if (err) throw err;
			console.log('Done!');
		});
	});

	// -- Create new script file based on the basic
	fs.readFile(query.script, 'utf8', function(err, data) {
		// data es el contenido del fichero
		if (err) throw err;
		// console.log(data);
		const urlParameter = data.replace(/parameter_urlAPI/gim, query.url_api);
		const orionUrlParameter = urlParameter.replace(/parameter_urlORION/gim, query.orion_url);
		const orionPortParameter = orionUrlParameter.replace(
			/parameter_orionPORT/gim,
			query.orion_port
		);
		const dataProviderParameter = orionPortParameter.replace(
			/parameter_dataProvider/gim,
			query.data_provider
		);

		directory = `${folderDirectory}/script.py`;

		fs.writeFile(directory, dataProviderParameter, 'utf-8', function(err, data) {
			if (err) throw err;
			console.log('Done!');
		});
	});

	// -- Create new Dockerfile based on the basic
	fs.readFile(query.dockerFile, 'utf8', function(err, data) {
		// data es el contenido del fichero
		if (err) throw err;
		// console.log(data);
		const fileUpdated = data.replace(/parameter_timeInterval/gim, query.time_interval);
		const timeUnit_newValue = fileUpdated.replace(
			/parameter_timeUnit/gim,
			`"${query.time_unit}"`
		);

		directory = `${folderDirectory}/Dockerfile`;

		fs.writeFile(directory, timeUnit_newValue, 'utf-8', function(err, data) {
			if (err) throw err;
			console.log('Done!');
		});
	});

	return folderName;
};
