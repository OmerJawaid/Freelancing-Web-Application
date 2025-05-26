-- Create the reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS reviews (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Order_Id INT NOT NULL,
    User_Id INT NOT NULL,
    Freelancer_Id INT NOT NULL,
    Gig_Id INT NOT NULL,
    Rating INT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Title VARCHAR(255) NOT NULL,
    Description TEXT,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Order_Id) REFERENCES orders(Id),
    FOREIGN KEY (User_Id) REFERENCES user(id),
    FOREIGN KEY (Freelancer_Id) REFERENCES freelancers(Id),
    FOREIGN KEY (Gig_Id) REFERENCES gigs(Id)
);

-- Add a column to track if the order has been reviewed
ALTER TABLE orders ADD COLUMN Reviewed BOOLEAN DEFAULT FALSE;

-- Add indexes for better performance
CREATE INDEX idx_reviews_order_id ON reviews(Order_Id);
CREATE INDEX idx_reviews_user_id ON reviews(User_Id);
CREATE INDEX idx_reviews_freelancer_id ON reviews(Freelancer_Id);
CREATE INDEX idx_reviews_gig_id ON reviews(Gig_Id);

-- Trigger to update freelancer rating when a review is added or updated
DELIMITER //
CREATE TRIGGER IF NOT EXISTS update_freelancer_rating AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    -- Calculate the new average rating for the freelancer
    UPDATE freelancers
    SET Rating = (
        SELECT AVG(Rating)
        FROM reviews
        WHERE Freelancer_Id = NEW.Freelancer_Id
    )
    WHERE Id = NEW.Freelancer_Id;
END //

CREATE TRIGGER IF NOT EXISTS update_freelancer_rating_on_update AFTER UPDATE ON reviews
FOR EACH ROW
BEGIN
    -- Calculate the new average rating for the freelancer
    UPDATE freelancers
    SET Rating = (
        SELECT AVG(Rating)
        FROM reviews
        WHERE Freelancer_Id = NEW.Freelancer_Id
    )
    WHERE Id = NEW.Freelancer_Id;
END //
DELIMITER ; 