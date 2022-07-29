import variables from '../utils/variables';
import request from '../utils/request_cygnus';
import requestNodeRED from '../utils/request_nodeRED';

export function insert(entity) {

	console.log('longitud', entity.data.length);
	let servicepath = '';
	for (var i = 0; i < entity.data.length; i++) {
		servicepath += '/,';
	}
	console.log('------------------');
  console.log('servicepath', servicepath);

	return request({
		url: '/notify',
		method: variables.METHOD_POST,
		data: entity,
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Ngsiv2-Attrsformat': 'normalized',
			'fiware-servicepath': servicepath
		}
	});
}

export function sendInfo(entity) {
	return requestNodeRED({
    url: '/datanotify',
		// url: '/notify', // for node-RED (testing purpose)
		method: variables.METHOD_POST,
		data: entity,
		headers: {
			'Content-Type': variables.Application_Json,
			Accept: variables.Application_Json
		}
	});
}
