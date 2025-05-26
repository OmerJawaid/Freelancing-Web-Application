import dotenv from 'dotenv';
import mysql from 'mysql2';

// Load environment variables
dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost'; // Fallback to your local host
const DB_USER = process.env.DB_USER || 'root'; // Fallback to your local user
const DB_PASSWORD = process.env.DB_PASSWORD || ''; // Fallback to your local password
const DB_NAME = process.env.DB_NAME || 'skillify'; // Fallback to your local database name
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 31935; // Fallback to your local port

// Create database connection pool
const database_pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT,
   
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
   
}).promise();

// Test the database connection
database_pool.query('SELECT 1')
    .then(() => console.log('✅ Database connection successful'))
    .catch(err => console.error('❌ Database connection failed:', err));

export { database_pool };