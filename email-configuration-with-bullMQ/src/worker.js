import { Worker } from 'bullmq';
import { connection, emailQueue } from './queue';

const emailWorker = new Worker(
    'emails',
    async (job) => {
        console.log('Processing email job...', job.id, job.name, job.data);
        (
            await new Promise((resolve) => setTimeout(resolve, 1500)),
            console.log('Email job completed', job.id, job.name, job.data)
        )
    },
    {
        connection
    },
);


emailWorker.on('completed', (job) => {
    console.log('Job Completed ! ', job.id, job.name, job.data)
});


emailQueue.on('failed', (job, err) => {
    console.log('Job Failed ! ', job.id, job.name, job.data, err)
});