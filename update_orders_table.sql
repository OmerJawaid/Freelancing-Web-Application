-- Add file-related columns to the orders table
ALTER TABLE orders ADD COLUMN file_path VARCHAR(255) NULL;
ALTER TABLE orders ADD COLUMN file_uploaded_at TIMESTAMP NULL;
ALTER TABLE orders ADD COLUMN file_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN file_disapproved BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN feedback TEXT NULL;

-- Create an index for faster file queries
CREATE INDEX idx_orders_file_path ON orders(file_path);

-- Verify columns were added correctly
DESCRIBE orders; 