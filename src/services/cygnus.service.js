import { insert } from '../api/cygnus';

const service = {};

service.insertCygnus = insertCygnus;

export default service;

// Implementation
async function insertCygnus(entity) {
	let cygnusEntity = null;
	try {
		cygnusEntity = await insert(entity);
	} catch (error) {
    console.log('CYGNUS SERVICE ERROR', error)
		throw new Error(error);
	}
	return cygnusEntity;
}
