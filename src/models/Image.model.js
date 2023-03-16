import { model, Schema } from 'mongoose';

const mySchema = new Schema(
  {
    Id: {
      type: 'String',
    },
    name: {
      type: 'String',
    },
    tag: {
      type: 'String',
    },
    created: {
      type: 'String',
      format: 'date-time',
    },
    type: {
      type: 'String',
    },
  },
  {
    _id: false,
  }
);

export default model('Image', mySchema);
