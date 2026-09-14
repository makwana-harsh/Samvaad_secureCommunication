import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';

import errorHandlerMiddleware from './middlewares/errorHandlerMiddleware.js';

import authRoutes from './modules/auth/auth.routes.js';
import homeRoutes from './modules/home/home.routes.js';
import discoverRoutes from './modules/discover/discover.routes.js';
import userRoutes from "./modules/user/user.routes.js";
import requestRoutes from "./modules/request/request.routes.js";
import groupRoutes from "./modules/group/group.routes.js";

const app = express();

app.use(helmet());
app.use(cors({
    origin : 'http://localhost:5173',
    credentials : true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended:true }));

app.use('/api/auth', authRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/users', userRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/groups", groupRoutes);

app.use(errorHandlerMiddleware);

export default app;