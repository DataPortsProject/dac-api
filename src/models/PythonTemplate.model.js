import { model, Schema } from 'mongoose';

const mySchema = new Schema(
	{
		source: {
			type: 'String'
		},
		type: {
			type: 'String'
		},
		datamodel: {
			type: 'String'
		},
		constants: {
			type: 'String'
		},
		dockerFile: {
			type: 'String'
		},
		script: {
			type: 'String'
		},
		template: { type: 'Mixed' }
	},
	{
		autoCreate: true,
		timestamps: true
	}
);

mySchema.index({ '$**': 'text' });

export default model('PythonTemplate', mySchema);
