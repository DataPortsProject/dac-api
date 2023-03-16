import { model, Schema } from 'mongoose';

const mySchema = new Schema(
  {
    ID_Container: {
      type: 'String',
    },
    Warnings: [],
    message: {
      type: 'String',
    },
  },
  {
    _id: false,
  }
);

mySchema.index({ '$**': 'text' });

export default model('Container', mySchema);
