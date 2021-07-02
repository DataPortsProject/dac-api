import { model, Schema } from 'mongoose';

const mySchema = new Schema(
  {
    Id: {
      type: 'String'
    },
    image: {
      type: 'String'
    },
    environment: []
  },
  {
    _id: false
  }
  /*,
  {
    timestamps: true
  }*/
);

//mySchema.index({ '$**': 'text' });

export default model('Template', mySchema);
