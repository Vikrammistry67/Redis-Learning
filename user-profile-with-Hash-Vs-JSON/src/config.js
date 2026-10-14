import dotenvConfig from "dotenv";

dotenvConfig.config();
const _config = {
    PORT: process.env.PORT || 3000,
    REDIS_PORT: Number(process.env.REDIS_PORT || 6379),
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined,
    REDIS_HOST: process.env.REDIS_HOST || "127.0.0.1",
};


export default _config;