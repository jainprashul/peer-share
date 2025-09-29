
import { EnvConfig, validateEnvironment } from "./validation/schemas";

export const config: EnvConfig = validateEnvironment(process.env);

export const MongoDBUrl = `mongodb+srv://${config.MONGO_USERNAME}:${config.MONGO_PASSWORD}@${config.MONGO_CLUSTER_URL}/${config.MONGO_DB_NAME}?retryWrites=true&w=majority&appName=PeerShare-dev`;


console.log("MongoDB Connection URL:", MongoDBUrl);