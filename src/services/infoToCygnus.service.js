import { sendInfo } from '../api/cygnus';

const service = {};

service.infoToCygnus = infoToCygnus;

export default service;

// Implementation
async function infoToCygnus(entity) {
  //console.log('Envio a CYGNUS')
  //console.log(entity)
	let cygnusEntity = null;
	try {
		cygnusEntity = await sendInfo(entity);
	} catch (error) {
    //console.log(error);
		throw new Error(error);
	}
	return cygnusEntity;
}
