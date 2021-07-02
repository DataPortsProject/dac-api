import { model, Schema } from 'mongoose';

const mySchema = new Schema(
	{
		Hostname: {
			type: 'String'
		},
		Domainname: {
			type: 'String'
		},
		User: {
			type: 'String'
		},
		Entrypoint: {
			type: 'String'
		},
		Image: {
			type: 'String'
		},
		Env: []
	},
	{
		_id: false
	}
	/*,
  {
    timestamps: true
  }*/
);

mySchema.index({ '$**': 'text' });

export default model('OnDemand', mySchema);
