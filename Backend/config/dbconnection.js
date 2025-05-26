import dotenv from 'dotenv';
import mysql from 'mysql2';

// Load environment variables
dotenv.config();

// Create database connection pool
const database_pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost', // Use Railway's host or localhost for local
    user: process.env.MYSQL_USER || 'your_local_user', // Use Railway's user or your local user
    password: process.env.MYSQL_PASSWORD || 'your_local_password', // Use Railway's password or your local password
    database: process.env.MYSQL_DATABASE || 'your_local_database_name', // Use Railway's db or your local db name
    port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 31935,
   
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
   
}).promise();

// Test the database connection
database_pool.query('SELECT 1')
    .then(() => console.log('✅ Database connection successful'))
    .catch(err => console.error('❌ Database connection failed:', err));

export { database_pool };