import variables from '../utils/variables';

const { exec } = require('child_process');

/* export async function doLogin() {
	exec(variables.gitlab_login_string, (error, stdout, stderr) => {
		if (error) {
			console.log(`error: ${error}`);
			return;
		}
		if (stderr) {
			console.log(`stderr: ${stderr}`);
			return;
		}
		console.log(`stdout: ${stdout}`);
	});
} */

export function doLogin() {
	return new Promise((resolve, reject) => {
		exec(variables.gitlab_login_string, { maxBuffer: 1024 * 500 }, (error, stdout, stderr) => {
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
