

export const MongoDBUrl = `${process.env.MONGO_BASE}://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DB_NAME}?${process.env.mongoParams}`;
