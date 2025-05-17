const db = require('./config/database');
const fs = require('fs');
const path = require('path');

console.log('Checking database structure...');

// Read the SQL file content
const gigsTableSQL = fs.readFileSync(path.join(__dirname, 'gigs_table.sql'), 'utf8');

// Split the SQL statements
const statements = gigsTableSQL.split(';').filter(statement => statement.trim() !== '');

// Execute each statement
statements.forEach((statement, index) => {
  // Add back the semicolon that was removed during split
  const sql = statement.trim() + ';';
  
  // Skip empty statements
  if (sql === ';') return;
  
  console.log(`Executing SQL statement ${index + 1}...`);
  
  db.query(sql, (err, results) => {
    if (err) {
      // Ignore errors about tables already existing
      if (err.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('Table already exists, continuing...');
      } else if (err.code === 'ER_DUP_KEYNAME') {
        console.log('Index already exists, continuing...');
      } else {
        console.error('Error executing SQL:', err);
      }
    } else {
      console.log('SQL statement executed successfully');
    }
  });
});

// Check if the users table exists
db.query("SHOW TABLES LIKE 'user'", (err, results) => {
  if (err) {
    console.error('Error checking user table:', err);
    return;
  }
  
  if (results.length === 0) {
    console.log('User table not found, creating it...');
    
    // Create user table if it doesn't exist
    const createUserTable = `
      CREATE TABLE IF NOT EXISTS user (
        id INT AUTO_INCREMENT PRIMARY KEY,
        Name VARCHAR(100) NOT NULL,
        Email VARCHAR(100) NOT NULL UNIQUE,
        Password VARCHAR(255) NOT NULL,
        User_Type ENUM('client', 'freelancer') NOT NULL,
        ProfileImage VARCHAR(255) DEFAULT NULL,
        Created_At DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    db.query(createUserTable, (err, results) => {
      if (err) {
        console.error('Error creating user table:', err);
      } else {
        console.log('User table created successfully');
      }
    });
  } else {
    console.log('User table exists');
  }
});

console.log('Database check complete!'); 