import { model, Schema } from 'mongoose';

const mySchema = new Schema(
  {
    name: {
      type: 'String',
    },
    description: {
      type: 'String',
    },
    link: {
      type: 'String',
    },
    privateRepository: {
      type: 'Boolean',
    },
    projectName: {
      type: 'String',
    },
  },
  {
    autoCreate: true,
    timestamps: true,
  }
);

mySchema.index({ '$**': 'text' });

export default model('DataModelObject', mySchema);
