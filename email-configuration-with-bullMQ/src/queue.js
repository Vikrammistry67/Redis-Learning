import { Queue } from 'bullmq';

export const connection = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
};


export const emailQueue = new Queue('email', { connection });


