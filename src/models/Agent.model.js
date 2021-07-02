import { model, Schema } from 'mongoose';

const mySchema = new Schema(
	{
		Id: {
			type: 'String'
		},
		Names: {
			type: 'Array'
		},
		Image: {
			type: 'String'
		},
		ImageID: {
			type: 'String'
		},
		Status: {
			type: 'String'
		},
		StatusCode: {
			type: 'String'
		},
		AgentType: {
			type: 'String'
		}
	},
	{ _id: false }
);

export default model('Agent', mySchema);
