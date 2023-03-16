import { model, Schema } from 'mongoose';

const mySchema = new Schema({
  ContainerName: {
    type: 'String',
  },
  Hostname: {
    type: 'String',
  },
  Domainname: {
    type: 'String',
  },
  User: {
    type: 'String',
  },
  Image: {
    type: 'String',
  },
  Env: [],
  // Puertos a mapear como "puerto_externo:puerto_interno"
  HostConfig: {
    PortBindings: {},
  },
});

mySchema.index({ '$**': 'text' });

export default model('AgentTemplate', mySchema);
