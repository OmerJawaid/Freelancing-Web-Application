// Backend/server.js or index.js
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import sessionMiddleware from './config/session.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'; // Add this for password hashing
import configureSocket from './sockets/sockets.js';
import http from 'http';
import dotenv from 'dotenv';
import {database_pool} from './config/dbconnection.js'
dotenv.config();
import { messageRouter } from './router/messageRouter.js';

const app = express();
const server = http.createServer(app);
const io = configureSocket(server);

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(sessionMiddleware);

//Messages
app.use('/messages', messageRouter);

const PORT = process.env.PORT || 8081;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});