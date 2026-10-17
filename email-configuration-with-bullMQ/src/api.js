import express from 'express';
import morgan from 'morgan';
import { emailQueue } from './queue.js';
import dotenv from 'dotenv';
dotenv.config();
const app = express();

app.use(express.json());
app.use(morgan('dev'));

app.post('/welcome-email', async (req, res) => {
    try {
        const job = emailQueue.add(
            'send-welcome-email',
            {
                to: req.body.to,
                name: req.body.name,
                subject: req.body.subject
            }, {
            attempts: 3,

            backoff: {
                type: 'exponential',
                delay: 5000
            },
        },
        );

        res.status(201).json({
            success: true,
            message: 'Welcome email job added to  the email Queue',
        });

    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    };
})


app.listen(8080, () => console.log('Redis Server is running at PORT : ', 8080));