import { database_pool } from "../config/dbconnection.js";

// Fetch reviews by Gig ID
const fetchReviewsByGigId = async(req, res) => {
    try {
        const { Gig_Id } = req.query;
        if (!Gig_Id) {
            return res.status(400).json({ message: "Gig_Id is required" });
        }
        
        console.log(`Attempting to fetch reviews for Gig_Id: ${Gig_Id}`);
        
        // First, try a simple query without joins to see if we get any results
        const [reviewsOnly] = await database_pool.query(
            `SELECT * FROM reviews WHERE Gig_Id = ?`, 
            [Gig_Id]
        );
        
        console.log(`Found ${reviewsOnly.length} reviews without joins`);
        
        if (reviewsOnly.length === 0) {
            console.log(`No reviews found for gig ${Gig_Id}`);
            return res.status(200).json([]);
        }
        
        // If we found reviews, now try with the join to get user details
        try {
            const [result] = await database_pool.query(
                `SELECT r.*, u.name as client_Name, u.image as client_Image 
                 FROM reviews r 
                 JOIN user u ON r.User_Id = u.id 
                 WHERE r.Gig_Id = ? 
                 ORDER BY r.Created_At DESC`,
                [Gig_Id]
            );
            
            console.log(`Query with joins returned ${result.length} reviews`);
            return res.json(result);
        } catch (joinError) {
            console.error("Error with join query:", joinError);
            // If the join fails, return the reviews without user details
            console.log("Falling back to reviews without user details");
            return res.json(reviewsOnly);
        }
    }
    catch (err) {
        console.error("Error fetching reviews:", err);
        res.status(500).json({ message: "Unable to retrieve reviews data" });
    }
};

// Fetch reviews by Freelancer ID
const fetchReviewsByFreelancerId = async(req, res) => {
    try {
        const { Freelancer_Id } = req.query;
        if (!Freelancer_Id) {
            return res.status(400).json({ message: "Freelancer_Id is required" });
        }
        
        const [result] = await database_pool.query(
            `SELECT r.*, g.Title as gig_Title, u.name as client_Name, u.image as client_Image 
             FROM reviews r 
             JOIN gigs g ON r.Gig_Id = g.Id 
             JOIN user u ON r.User_Id = u.id 
             WHERE r.Freelancer_Id = ? 
             ORDER BY r.Created_At DESC`,
            [Freelancer_Id]
        );
        
        if (!result || result.length === 0) {
            return res.status(200).json([]);
        }
        
        return res.json(result);
    }
    catch (err) {
        console.error("Error fetching reviews by freelancer:", err);
        res.status(500).json({ message: "Unable to retrieve reviews data" });
    }
};

// Check if an order can be reviewed
const checkOrderForReview = async(req, res) => {
    try {
        const { Order_Id } = req.query;
        if (!Order_Id) {
            return res.status(400).json({ message: "Order_Id is required" });
        }
        
        // Check if the order exists, is completed, and not already reviewed
        const [orderResult] = await database_pool.query(
            `SELECT o.*, g.Title as gig_Title, f.Name as freelancer_Name
             FROM orders o
             JOIN gigs g ON o.Gig_Id = g.Id
             JOIN freelancers f ON o.Freelancer_Id = f.Id
             WHERE o.Id = ? AND o.Status = 'completed' AND o.file_approved = TRUE AND o.Reviewed = FALSE`,
            [Order_Id]
        );
        
        if (!orderResult || orderResult.length === 0) {
            return res.status(200).json({ canReview: false, message: "Order not found, not completed, or already reviewed" });
        }
        
        return res.json({ 
            canReview: true, 
            orderDetails: orderResult[0] 
        });
    }
    catch (err) {
        console.error("Error checking order for review:", err);
        res.status(500).json({ message: "Unable to check order status" });
    }
};

// Create a new review
const createReview = async(req, res) => {
    try {
        const { Order_Id, Rating, Title, Description } = req.body;
        
        if (!Order_Id || !Rating || !Title) {
            return res.status(400).json({ message: "Order_Id, Rating, and Title are required" });
        }
        
        // Verify the order exists and is completed
        const [orderCheck] = await database_pool.query(
            `SELECT * FROM orders WHERE Id = ? AND Status = 'completed' AND file_approved = TRUE AND Reviewed = FALSE`,
            [Order_Id]
        );
        
        if (!orderCheck || orderCheck.length === 0) {
            return res.status(400).json({ message: "Order not found, not completed, or already reviewed" });
        }
        
        const order = orderCheck[0];
        
        // Begin a transaction
        await database_pool.query('START TRANSACTION');
        
        try {
            // Insert the review
            const [reviewResult] = await database_pool.query(
                `INSERT INTO reviews (Order_Id, User_Id, Freelancer_Id, Gig_Id, Rating, Title, Description)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [Order_Id, order.User_Id, order.Freelancer_Id, order.Gig_Id, Rating, Title, Description || ""]
            );
            
            // Mark the order as reviewed
            await database_pool.query(
                `UPDATE orders SET Reviewed = TRUE WHERE Id = ?`,
                [Order_Id]
            );
            
            // Commit the transaction
            await database_pool.query('COMMIT');
            
            return res.status(201).json({ 
                message: "Review created successfully", 
                reviewId: reviewResult.insertId 
            });
        } catch (transactionError) {
            // Rollback in case of error
            await database_pool.query('ROLLBACK');
            throw transactionError;
        }
    }
    catch (err) {
        console.error("Error creating review:", err);
        res.status(500).json({ message: "Unable to create review", error: err.message });
    }
};

// Get client's previously submitted reviews
const getClientReviews = async(req, res) => {
    try {
        const { User_Id } = req.query;
        if (!User_Id) {
            return res.status(400).json({ message: "User_Id is required" });
        }
        
        const [result] = await database_pool.query(
            `SELECT r.*, g.Title as gig_Title, f.Name as freelancer_Name, f.Image as freelancer_Image 
             FROM reviews r 
             JOIN gigs g ON r.Gig_Id = g.Id 
             JOIN freelancers f ON r.Freelancer_Id = f.Id 
             WHERE r.User_Id = ? 
             ORDER BY r.Created_At DESC`,
            [User_Id]
        );
        
        return res.json(result);
    }
    catch (err) {
        console.error("Error fetching client reviews:", err);
        res.status(500).json({ message: "Unable to retrieve client reviews" });
    }
};

// Get reviews statistics for a freelancer
const getFreelancerReviewStats = async(req, res) => {
    try {
        const { Freelancer_Id } = req.query;
        if (!Freelancer_Id) {
            return res.status(400).json({ message: "Freelancer_Id is required" });
        }
        
        // Get the average rating and count by rating
        const [stats] = await database_pool.query(
            `SELECT 
                COUNT(*) as total_reviews,
                AVG(Rating) as average_rating,
                SUM(CASE WHEN Rating = 5 THEN 1 ELSE 0 END) as five_star,
                SUM(CASE WHEN Rating = 4 THEN 1 ELSE 0 END) as four_star,
                SUM(CASE WHEN Rating = 3 THEN 1 ELSE 0 END) as three_star,
                SUM(CASE WHEN Rating = 2 THEN 1 ELSE 0 END) as two_star,
                SUM(CASE WHEN Rating = 1 THEN 1 ELSE 0 END) as one_star
             FROM reviews
             WHERE Freelancer_Id = ?`,
            [Freelancer_Id]
        );
        
        if (!stats || stats.length === 0) {
            return res.json({
                total_reviews: 0,
                average_rating: 0,
                rating_breakdown: {
                    five_star: 0,
                    four_star: 0,
                    three_star: 0,
                    two_star: 0,
                    one_star: 0
                }
            });
        }
        
        const statsData = stats[0];
        
        return res.json({
            total_reviews: statsData.total_reviews || 0,
            average_rating: statsData.average_rating || 0,
            rating_breakdown: {
                five_star: statsData.five_star || 0,
                four_star: statsData.four_star || 0,
                three_star: statsData.three_star || 0,
                two_star: statsData.two_star || 0,
                one_star: statsData.one_star || 0
            }
        });
    }
    catch (err) {
        console.error("Error fetching freelancer review stats:", err);
        res.status(500).json({ message: "Unable to retrieve review statistics" });
    }
};

// Debug endpoint to check reviews table
const checkReviewsTable = async(req, res) => {
    try {
        // First check if the table exists
        const [tables] = await database_pool.query(
            `SHOW TABLES LIKE 'reviews'`
        );
        
        if (tables.length === 0) {
            return res.status(404).json({ message: "Reviews table does not exist" });
        }
        
        // Then check table structure
        const [columns] = await database_pool.query(
            `SHOW COLUMNS FROM reviews`
        );
        
        // Get raw reviews without joins to eliminate join issues
        const [reviews] = await database_pool.query(
            `SELECT * FROM reviews LIMIT 10`
        );
        
        return res.json({
            tableExists: true,
            columns: columns,
            sampleData: reviews
        });
    }
    catch (err) {
        console.error("Error checking reviews table:", err);
        res.status(500).json({ message: "Error checking reviews table", error: err.toString() });
    }
};

export { 
    fetchReviewsByGigId,
    fetchReviewsByFreelancerId,
    checkOrderForReview,
    createReview,
    getClientReviews,
    getFreelancerReviewStats,
    checkReviewsTable
};