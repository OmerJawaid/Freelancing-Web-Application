import dotenv from 'dotenv';
import mysql from 'mysql2';

// Load environment variables
dotenv.config();

// Create database connection pool
const database_pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',  // Remove hardcoded password
    database: process.env.DB_NAME || 'skillify',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

// Test the database connection
database_pool.query('SELECT 1')
    .then(() => console.log('✅ Database connection successful'))
    .catch(err => console.error('❌ Database connection failed:', err));

export { database_pool };