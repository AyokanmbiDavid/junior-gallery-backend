import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'dns';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { checkDriveConnection } from './config/googleDrive.js';
import memberRoutes from './routes/memberRoutes.js';
import statusRoutes from './routes/statusRoutes.js';
import throwbackRoutes from './routes/throwbackRoutes.js';

dns.setDefaultResultOrder('ipv4first');


const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://miracle-center-junior-church-galler.vercel.app'
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Optional: if you are sending cookies/authorization headers
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/members', memberRoutes);
app.use('/api/statuses', statusRoutes);
app.use('/api/throwbacks', throwbackRoutes);

app.get('/', (req, res) => {
  res.send('Church Gallery API is running');
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('Successfully connected to MongoDB Database');
    
    // Verify Google Drive OAuth2 connection
    await checkDriveConnection();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  });