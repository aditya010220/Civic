import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './db/mongo.js';
import campaignRoute from './routes/campaignRoutes.js'; // Assuming you have a campaignRoute
import campaignActivityRoute from './routes/activityRoute.js'; 
import victimRoutes from './routes/CampaignVictimRoute.js'; // Assuming you have a victimRoute
//Routes 
import authRoute from './routes/authRoute.js';
import supporterRoutes from './routes/CampaignSupport.js'; // Assuming you have a supporterRoute

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
app.use('/api/campaigns', campaignRoute); 
app.use('/api/campaigns', campaignActivityRoute); 
app.use('/api/campaigns/:campaignId/victims', victimRoutes);
app.use('/api/campaigns/:campaignId/supporters', supporterRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

