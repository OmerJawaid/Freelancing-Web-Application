import dotenv from 'dotenv';
import mysql from 'mysql2';

dotenv.config();

const database_pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Hina@1976',
    database: 'skillify',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

export { database_pool };