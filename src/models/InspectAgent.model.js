import { model, Schema } from 'mongoose';

const mySchema = new Schema(
	{
		Id: {
			type: 'String'
		},
		Image: {
			type: 'String'
		},
		Status: {
			type: 'String'
		},
		Environment: []
	},
	{ _id: false }
);

export default model('InspectAgent', mySchema);
