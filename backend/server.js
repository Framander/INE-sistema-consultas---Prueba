import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes.js';
import consultRoutes from './routes/consultRoutes.js';
import consultRoutesPrueba from'./routes/consultRoutesPrueba.js'
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import connectDB from './config/db.js';
import cors from 'cors';

// import router from './routes/consultRoutesPrueba.js';

dotenv.config();

connectDB();

const port = process.env.PORT || 5000;
const address = process.env.ADDRESS || "localhost";

console.log(address);

const app = express();

app.use(cors({
    origin: true, 
    credentials: true
}));

app.use(cookieParser());

app.use(express.json());

// This is to send form data
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);
app.use('/api/users/consults', consultRoutes);
app.use('/api/users/peticion', consultRoutesPrueba);
// app.use('/api/users/prueva', router);



app.get('/', (req, res) => res.send('Server is ready'));

app.use(notFound);
app.use(errorHandler);

app.listen(port, address ,() => console.log(`Server started on  ${port}`));