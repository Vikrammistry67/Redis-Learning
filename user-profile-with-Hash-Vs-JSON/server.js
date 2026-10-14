import app from "./src/app.js";
import { Redis } from "ioredis";
import _config from "./src/config.js";

const _redis = new Redis({
    host: _config.REDIS_HOST,
    port: Number(_config.REDIS_PORT),
    password: _config.REDIS_PASSWORD,
});

console.log(_config.REDIS_HOST);
_redis.on("connect", () => {
    console.log("Redis Connected!");
});

_redis.on("error", (error) => {
    console.error("Redis Error:", error.message);
});

app.listen(_config.PORT, () => {
    console.log("Server Listening on PORT", _config.PORT);
});