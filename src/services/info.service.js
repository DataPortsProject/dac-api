import InfoModel from '../models/Info.model';

// Implementation
export async function getOne(id) {
  return InfoModel.findOne({ random_id: id })
    .exec()
    .catch((error) => {
      throw new Error(error);
    });
}

export async function getAll(query) {
  return InfoModel.find(query)
    .exec()
    .catch((error) => {
      throw new Error(error);
    });
}

export async function deleteInfo(randomId) {
  return InfoModel.deleteOne({ random_id: randomId })
    .exec()
    .catch((error) => {
      throw new Error(error);
    });
}

export async function deleteInfoByContainer(containerName) {
  return InfoModel.deleteOne({ container_name: containerName })
    .exec()
    .catch((error) => {
      throw new Error(error);
    });
}

export async function create(query) {
  return new InfoModel(query).save().catch((error) => {
    throw new Error(error);
  });
}

export async function getFiltered(id, interval, unit) {
  return InfoModel.find({
    random_id: id,
    time_interval: interval,
    time_unit: unit,
  })
    .exec()
    .catch((error) => {
      throw new Error(error);
    });
}
