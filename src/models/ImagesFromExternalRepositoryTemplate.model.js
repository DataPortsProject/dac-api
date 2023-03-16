import { model, Schema } from 'mongoose';

const mySchema = new Schema(
  {
    url: {
      type: 'String',
    },
    usr: {
      type: 'String',
    },
    pass: {
      type: 'String',
    },
    privateRepository: {
      type: 'Boolean',
    },
  },
  { _id: false }
);

export default model('ImagesFromExternalRepositoryTemplate', mySchema);
