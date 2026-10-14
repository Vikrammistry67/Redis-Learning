import express from 'express';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import morgan from 'morgan';

dotenv.config();

const app = express();
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 8080;
const BANNER_KEY = 'app:banner';



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

redis.on('connect', () => {
    console.log('Connecting to Redis Cloud...');
});

redis.on('ready', () => {
    console.log('Redis Cloud connected and ready');
});

redis.on('error', (err) => {
    console.error('Redis error:', err.message);
});

app.get('/', (req, res) => {
    res.send('Express server is running');
});


app.get('/redis-test', async (req, res) => {
    try {
        await redis.set('test', 'Redis is working', 'EX', 60);
        const value = await redis.get('test');

        res.json({
            success: true,
            message: value,
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            message: 'Redis is unavailable',
        });
    }
});

app.post('/banner', async (req, res) => {
    const message = await _redis.set(BANNER_KEY, req.body.message || 'Welcome to our Website !');
    return res.json({ success: true });
});


app.get('/banner', async (req, res) => {
    const message = await _redis.get(BANNER_KEY);
    return res.status(200).json({ message });
})


app.delete('/banner', async (req, res) => {
    const deletedMessage = await _redis.del(BANNER_KEY);
    return res.status(200).json({
        success: true
    });
});


app.get('/banner/exists', async (req, res) => {
    const exists = await _redis.exists(BANNER_KEY);
    return res.status(200).json({
        success: true,
        exists: Boolean(exists),
    });
});





async function startServer() {
    try {
        await redis.connect();

        app.listen(8080, () => {
            console.log(`Express server running on port ${8080}`);
        });
    } catch (error) {
        console.error('Failed to connect to Redis:', error.message);
        process.exit(1);
    }
}

startServer();
