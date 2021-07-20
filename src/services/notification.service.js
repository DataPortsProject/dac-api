import NotificationModel from '../models/Notification.model';

const service = {};

service.getOne = getOne;
service.getAll = getAll;
service.create = create;
service.deleteNotification = deleteNotification;

export default service;

// Implementation
async function getOne(id) {
	let data = [];
	try {
		data = await NotificationModel.findOne({ _id: id });
	} catch (error) {
		throw new Error(error);
	}
	return data;
}

async function getAll(query) {
	let data = [];
	try {
		data = NotificationModel.find(query).sort({ createdAt: -1 });
		/* data = data.sort((a, b) => {
			return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
		}); */
	} catch (error) {
		throw new Error(error);
	}
	return data;
}


async function deleteNotification(id, query) {
	let data = [];
	try {
		if (query.all) {
			data = await NotificationModel.collection.remove();
		} else {
			data = await NotificationModel.deleteOne({ _id: id });
		}
	} catch (error) {
		throw new Error(error);
	}
	return data;
}

async function create(query) {
	let data = null;
	try {
		data = await new NotificationModel(query).save();
	} catch (error) {
		throw new Error(error);
	}
	return data;
}
