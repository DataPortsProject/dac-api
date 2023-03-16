import NotificationModel from '../models/Notification.model';

import logger from '../config/winston';

// Implementation
export async function getOne(id) {
  return NotificationModel.findOne({ _id: id })
    .exec()
    .catch((error) => {
      throw new Error(error);
    });
}

export async function getAll(query, limit, offset) {
  let data = [];
  const parsedLimit =
    limit !== undefined && Number.isInteger(Number(limit)) && Number(limit) > 0
      ? Math.min(Number(limit), 100) // limit to max 100 docs
      : 10;
  const parsedOffset =
    offset !== undefined && Number.isInteger(Number(offset)) && Number(offset) > 0
      ? Number(offset)
      : 0;
  logger.debug(
    `Retrieving notifications matching the query ${JSON.stringify(
      query
    )}. Pagination set to limit:${parsedLimit}, offset:${parsedOffset}`
  );
  let count = 0;
  const parsedQuery = { ...query };
  if (query.id !== undefined && query.id !== null) {
    parsedQuery.id = { $regex: query.id, $options: 'i' };
  } else if (query.id === '') {
    delete parsedQuery.id;
  }
  try {
    count = await NotificationModel.countDocuments(parsedQuery).exec();
    data = await NotificationModel.find(parsedQuery)
      .skip(parsedOffset)
      .limit(parsedLimit)
      .sort({ createdAt: -1 })
      .exec();
    return { data, count };
  } catch (error) {
    logger.error('Failed retrieving all notifications:', error.toString());
    throw new Error(error);
  }
}

export async function deleteNotification(id, query) {
  if (query.all) {
    return NotificationModel.deleteMany({}).exec();
  }
  return NotificationModel.deleteOne({ _id: id }).exec();
}

export async function create(query) {
  return new NotificationModel(query).save().catch((error) => {
    throw new Error(error);
  });
}
