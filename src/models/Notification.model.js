import { model, Schema } from 'mongoose';

const mySchema = new Schema(
	{
		id: {
			type: 'String'
		},
		type: {
			type: 'String'
		},
		message: {
			type: 'String'
		}
	},
	{
		autoCreate: true,
		timestamps: true
	}
);

mySchema.index({ '$**': 'text' });

export default model('Notification', mySchema);
