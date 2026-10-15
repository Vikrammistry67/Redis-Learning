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



// User Profile store in Redis DB --------------->


// ------------------------------------------------- JSON ----------------------------------------------------------------------------------
// POST -> /user/:userId/json ---> saved as JSON.

app.post('/user/:userId/json', async (req, res) => {
    const user = await _redis.set(`user:${req.params.userId}:json`, JSON.stringify(req.body));
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    };

    return res.status(201).json({
        success: true,
        savedAs: 'json',
    });
});



// get users from Redis ---->
// GET -> /user/:userId/json --> getJSON user Data ( imp =>  we have to convert JSON to String from redis DB )

app.get('/user/:userId/json', async (req, res) => {
    const user = await _redis.get(`user:${req.params.userId}:json`);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    };

    return res.status(200).json({
        success: true,
        message: 'User fetched successfully',
        user: user ? JSON.parse(user) : null
    });
});




// ------------------------------------------------- HASH ----------------------------------------------------------------------------------
// set User in Hash formate means n Object like --->
// POST : /user/:userId/hash

app.post('/user/:userId/hash', async (req, res) => {
    const user = await _redis.hset(`user:${req.params.userId}:hash`, req.body);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    };

    return res.status(201).json({
        success: true,
        savedAs: 'Hash'
    });
});



//get user from redis as a hash ( but imp we have to convert it into String ).
// GET : /user/:userId/hash
app.get('/user/:userId/hash', async (req, res) => {
    const user = await _redis.hgetall(`user:${req.params.userId}:hash`);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    };

    console.log(user)
    return res.status(200).json({
        success: true,
        message: 'user fetched successfully',
        user: user ? user : null
    });
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
