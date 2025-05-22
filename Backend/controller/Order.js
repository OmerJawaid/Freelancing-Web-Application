import { database_pool } from "../config/dbconnection.js";

// Create a new order
const createOrder = async (req, res) => {
  try {
    const { User_Id, Freelancer_Id, Gig_Id, Package_Id } = req.body;

    // Validate required fields
    if (!User_Id || !Freelancer_Id || !Gig_Id) {
      return res.status(400).json({ message: "Missing required order information" });
    }

    // Create the order
    const [result] = await database_pool.query(
      'INSERT INTO orders (User_Id, Freelancer_Id, Gig_Id, Package_Id, Status) VALUES (?, ?, ?, ?, "pending")',
      [User_Id, Freelancer_Id, Gig_Id, Package_Id]
    );

    return res.status(201).json({ 
      message: "Order created successfully", 
      orderId: result.insertId 
    });
  } catch (err) {
    console.error("Error creating order:", err);
    return res.status(500).json({ message: "Error creating order", error: err.message });
  }
};

// Get orders for a client
const getClientOrders = async (req, res) => {
  try {
    const { User_Id } = req.query;
    
    if (!User_Id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const [result] = await database_pool.query(
      `SELECT orders.*, gigs.Title, gigs.Image, 
       freelancers.Name as FreelancerName, freelancers.Image as FreelancerImage,
       packages.Type, packages.Price
       FROM orders 
       JOIN gigs ON orders.Gig_Id = gigs.Id
       JOIN freelancers ON orders.Freelancer_Id = freelancers.Id
       LEFT JOIN packages ON orders.Package_Id = packages.ID
       WHERE orders.User_Id = ?
       ORDER BY orders.Created_At DESC`,
      [User_Id]
    );

    return res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching client orders:", err);
    return res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
};

// Get orders for a freelancer
const getFreelancerOrders = async (req, res) => {
  try {
    const { Freelancer_Id } = req.query;
    
    if (!Freelancer_Id) {
      return res.status(400).json({ message: "Freelancer ID is required" });
    }

    const [result] = await database_pool.query(
      `SELECT orders.*, gigs.Title, gigs.Image,
       clients.Name as ClientName, clients.Image as ClientImage,
       packages.Type, packages.Price
       FROM orders 
       JOIN gigs ON orders.Gig_Id = gigs.Id
       JOIN clients ON orders.User_Id = clients.Id
       LEFT JOIN packages ON orders.Package_Id = packages.ID
       WHERE orders.Freelancer_Id = ?
       ORDER BY orders.Created_At DESC`,
      [Freelancer_Id]
    );

    return res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching freelancer orders:", err);
    return res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { Id } = req.params;
    const { Status } = req.body;
    
    if (!Id || !Status) {
      return res.status(400).json({ message: "Order ID and Status are required" });
    }

    // Validate status
    const validStatuses = ['pending', 'approved', 'in_progress', 'completed', 'rejected'];
    if (!validStatuses.includes(Status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const [result] = await database_pool.query(
      'UPDATE orders SET Status = ? WHERE Id = ?',
      [Status, Id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({ message: "Order status updated successfully" });
  } catch (err) {
    console.error("Error updating order status:", err);
    return res.status(500).json({ message: "Error updating order status", error: err.message });
  }
};

export { createOrder, getClientOrders, getFreelancerOrders, updateOrderStatus }; 