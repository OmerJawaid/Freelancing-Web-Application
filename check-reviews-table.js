const mysql = require('mysql2/promise');

async function checkReviewsTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Ahmad123',
    database: 'skillify'
  });

  console.log('Connected to MySQL database');

  try {
    // Check if the reviews table exists
    const [tables] = await connection.query('SHOW TABLES LIKE "reviews"');
    if (tables.length === 0) {
      console.log('Reviews table does not exist');
      return;
    }

    console.log('Reviews table exists');

    // Check the structure of the reviews table
    const [columns] = await connection.query('SHOW COLUMNS FROM reviews');
    console.log('Reviews table structure:');
    columns.forEach(column => {
      console.log(`- ${column.Field} (${column.Type})`);
    });

    // Check if there are any records in the table
    const [count] = await connection.query('SELECT COUNT(*) as count FROM reviews');
    console.log(`Reviews table contains ${count[0].count} records`);

    if (count[0].count > 0) {
      // Get some sample records
      const [reviews] = await connection.query('SELECT * FROM reviews LIMIT 5');
      console.log('Sample reviews:');
      reviews.forEach(review => {
        console.log('-'.repeat(40));
        console.log(`ID: ${review.Id}`);
        console.log(`Order ID: ${review.Order_Id}`);
        console.log(`User ID: ${review.User_Id}`);
        console.log(`Freelancer ID: ${review.Freelancer_Id}`);
        console.log(`Gig ID: ${review.Gig_Id}`);
        console.log(`Rating: ${review.Rating}`);
        console.log(`Title: ${review.Title}`);
        console.log(`Description: ${review.Description ? review.Description.substring(0, 50) + '...' : 'N/A'}`);
        console.log(`Created At: ${review.Created_At}`);
      });

      // Check user table
      console.log('\nChecking user table connectivity:');
      try {
        const [userCheck] = await connection.query(`
          SELECT r.Id, r.User_Id, u.id, u.name 
          FROM reviews r 
          JOIN user u ON r.User_Id = u.id 
          LIMIT 3
        `);
        
        console.log('Join with user table successful:');
        userCheck.forEach(row => {
          console.log(`Review ID: ${row.Id}, User ID: ${row.User_Id}, User name: ${row.name}`);
        });
      } catch (joinError) {
        console.error('Error joining with user table:', joinError.message);
        
        // Check if user table exists
        const [userTable] = await connection.query('SHOW TABLES LIKE "user"');
        if (userTable.length === 0) {
          console.log('User table does not exist');
        } else {
          console.log('User table exists, checking structure:');
          const [userColumns] = await connection.query('SHOW COLUMNS FROM user');
          userColumns.forEach(column => {
            console.log(`- ${column.Field} (${column.Type})`);
          });
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
    console.log('MySQL connection closed');
  }
}

checkReviewsTable(); 