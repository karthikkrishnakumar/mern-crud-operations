import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
connectDB();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use('/api/users', userRoutes);
app.get('/', (req, res) => res.send('API running'));
app.listen(port, () => console.log(`Server started on port ${port}`));
app.use(notFound);
app.use(errorHandler);