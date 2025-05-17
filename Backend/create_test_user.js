const db = require('./config/database');
const bcrypt = require('bcrypt');

console.log('Creating test user...');

// Function to create a test user
async function createTestUser() {
  try {
    // Check if user already exists
    db.query('SELECT * FROM user WHERE Email = ?', ['test@freelancer.com'], async (err, results) => {
      if (err) {
        console.error('Error checking user:', err);
        process.exit(1);
        return;
      }
      
      if (results.length > 0) {
        console.log('Test user already exists, skipping creation');
        
        // Return the existing user ID
        console.log('Existing Test User ID:', results[0].id);
        process.exit(0);
        return;
      }
      
      // Create a new user if it doesn't exist
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const insertQuery = `
        INSERT INTO user (Name, Email, Password, User_Type, ProfileImage, Created_At)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;
      
      db.query(
        insertQuery,
        ['Test Freelancer', 'test@freelancer.com', hashedPassword, 'freelancer', '/uploads/default-avatar.jpg'],
        (err, results) => {
          if (err) {
            console.error('Error creating test user:', err);
            process.exit(1);
            return;
          }
          
          console.log('Test user created successfully with ID:', results.insertId);
          
          // Add a sample gig for the test user
          const gigQuery = `
            INSERT INTO gigs (
              Title, 
              Description, 
              Price, 
              Category, 
              Image, 
              Freelancer_Id,
              State,
              Creation_Date
            ) VALUES (?, ?, ?, ?, ?, ?, 1, NOW())
          `;
          
          db.query(
            gigQuery, 
            [
              'Test Gig - Web Development', 
              'This is a test gig for web development services.', 
              99.99, 
              'web-development', 
              '/uploads/gigs/default-gig.jpg', 
              results.insertId
            ], 
            (err, results) => {
              if (err) {
                console.error('Error adding test gig:', err);
                process.exit(1);
              } else {
                console.log('Test gig added successfully with ID:', results.insertId);
                process.exit(0);
              }
            }
          );
        }
      );
    });
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser(); 