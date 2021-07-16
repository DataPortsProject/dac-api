import { model, Schema } from 'mongoose';

const mySchema = new Schema(
	{
		random_id: {
			type: 'String'
		},
		container_name: {
			type: 'String'
		}
	},
	{
		autoCreate: true,
		timestamps: true
	}
);

mySchema.index({ '$**': 'text' });

export default model('Info', mySchema);
