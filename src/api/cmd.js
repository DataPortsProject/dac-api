import variables from '../utils/variables';

const { exec } = require('child_process');

export function doLogin(body) {
	return new Promise((resolve, reject) => {
		exec(
			`docker login -u ${body.user} -p ${body.accessToken} ${body.repositoryUrl}`,
			{ maxBuffer: 1024 * 500 },
			(error, stdout, stderr) => {
				if (error) {
					console.warn(error);
				} else if (stdout) {
					console.log(stdout);
				} else {
					console.log(stderr);
				}
				resolve(!!stdout);
		});
	});
}

export function downloadImage(path) {
	return new Promise((resolve, reject) => {
		exec(`docker pull ${path}`, { maxBuffer: 1024 * 500 }, (error, stdout, stderr) => {
			if (error) {
				console.warn(error);
			} else if (stdout) {
				console.log(stdout);
			} else {
				console.log(stderr);
			}
			resolve(!!stdout);
		});
	});
}
