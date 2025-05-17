const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const gigsDir = path.join(uploadsDir, 'gigs');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('Created uploads directory');
}

if (!fs.existsSync(gigsDir)) {
  fs.mkdirSync(gigsDir);
  console.log('Created gigs directory');
}

console.log('Setup completed successfully'); 