import express from 'express';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import morgan from 'morgan';

dotenv.config();

const app = express();
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 8080;

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






// store email in a redis DB ---->
// POST : /emails

let QUEKEY = 'queue:emails';
app.post('/emails', async (req, res) => {
    try {
        const job = {
            to: req.body.to,
            subject: req.body.subject,
            body: req.body.body
        };
        const email = await _redis.lpush(QUEKEY, JSON.stringify(job));
        if (!email) {
            return res.status(404).json({
                success: false,
                message: 'Email is not Available in Queue'
            });
        };

        return res.status(201).json({
            success: true,
            message: 'Email pushed successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Inter server error'
        });
    };
});



// GET emails ( process Email );
// GET : /email/process-one ( we have to convert string to JSON ).


app.get('/emails/process-one', async (req, res) => {
    try {
        const rawJob = await _redis.rpop(QUEKEY);

        if (!rawJob) {
            return res.status(404).json({
                success: false,
                message: 'Email is not Available in Queue'
            });
        };

        return res.status(200).json({
            success: false,
            message: 'Email Sent',
            email: rawJob ? JSON.parse(rawJob) : null
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Inter server error'
        });
    };
});


























async function startServer() {
    try {
        await _redis.connect();

        app.listen(8080, () => {
            console.log(`Express server running on port ${8080}`);
        });
    } catch (error) {
        console.error('Failed to connect to Redis:', error.message);
        process.exit(1);
    }
}

startServer();
