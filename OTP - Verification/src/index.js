import express from 'express';
import Redis from 'ioredis';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config();
const app = express();


app.use(express.json());
app.use(morgan('dev'));


const _redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    ...(process.env.REDIS_TLS === 'true' && { tls: {} }),
    lazyConnect: true,
    maxRetriesPerRequest: 2,
    retryStrategy(times) {
        return Math.min(times * 1000, 5000);
    },
});

_redis.on('connect', () => {
    console.log('Connecting to Redis Cloud...');
});

_redis.on('ready', () => {
    console.log('Redis Cloud connected and ready');
});

_redis.on('error', (err) => {
    console.error('Redis error:', err.message);
});

app.get('/', (req, res) => {
    res.send('Express server is running');
});



app.listen(process.env.PORT, () => console.log('Redis Server is running at PORT', process.env.PORT));