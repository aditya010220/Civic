import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './db/mongo.js';
import campaignRoute from './routes/campaignRoutes.js'; // Assuming you have a campaignRoute

//Routes 
import authRoute from './routes/authRoute.js';

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));


app.get('/', (req, res) => {
  res.send('Hello World!');
}
);


app.use('/api/users', authRoute);
app.use('/api/campaigns', campaignRoute); // Assuming you have a campaignRoute


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

