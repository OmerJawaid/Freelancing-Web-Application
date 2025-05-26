import { database_pool } from "../config/dbconnection.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { createNotification } from './Notification.js';


// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './public/uploads/orders';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `order-${uniqueSuffix}${ext}`);
  }
});

// File filter to only allow zip files
const fileFilter = (req, file, cb) => {
  // Accept only zip files
  if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed' || path.extname(file.originalname).toLowerCase() === '.zip') {
    cb(null, true);
  } else {
    cb(new Error('Only ZIP files are allowed'), false);
  }
};

export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit file size to 10MB
  },
  fileFilter: fileFilter
});

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

     await createNotification(
            Freelancer_Id,
            'order',
            'New Order Received',
            'You have received a new order. Check your orders page for details.',
            result.insertId
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

// Upload completed work file
const uploadCompletedWork = async (req, res) => {
  try {
    const { Id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded or file type not allowed. Only ZIP files are accepted." });
    }

    // Get the relative path to store in database
    const filePath = req.file.path.replace(/\\/g, '/');

    // Update the order with the file path and reset disapproval status if it was previously disapproved
    const [result] = await database_pool.query(
      'UPDATE orders SET file_path = ?, file_uploaded_at = NOW(), file_approved = FALSE, file_disapproved = FALSE WHERE Id = ?',
      [filePath, Id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

     const [order] = await database_pool.query(
            'SELECT User_Id FROM orders WHERE Id = ?',
            [Id]
        );
        
        if (order && order.length > 0) {
            // Create notification for the client
            await createNotification(
                order[0].User_Id,
                'order_work',
                'Work Uploaded',
                'A freelancer has uploaded work for your order. Check your orders page for details.',
                Id
            );
        }

    return res.status(200).json({ 
      message: "File uploaded successfully",
      filePath: filePath
    });
  } catch (err) {
    console.error("Error uploading file:", err);
    return res.status(500).json({ message: "Error uploading file", error: err.message });
  }
};

// Download completed work file
const downloadCompletedWork = async (req, res) => {
  try {
    const { Id } = req.params;
    
    // Get the file path from the database
    const [result] = await database_pool.query(
      'SELECT file_path FROM orders WHERE Id = ?',
      [Id]
    );

    if (result.length === 0 || !result[0].file_path) {
      return res.status(404).json({ message: "File not found for this order" });
    }

    const filePath = result[0].file_path;
    const absolutePath = path.resolve(filePath);

    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    // Get the original filename from the path
    const originalFileName = path.basename(filePath);
    
    // Set appropriate headers for ZIP file
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${originalFileName}"`);

    // Send the file as a stream instead of using res.download
    const fileStream = fs.createReadStream(absolutePath);
    fileStream.pipe(res);
    
    // Handle errors in the stream
    fileStream.on('error', (err) => {
      console.error("Error streaming file:", err);
      if (!res.headersSent) {
        res.status(500).json({ message: "Error downloading file", error: err.message });
      }
    });
  } catch (err) {
    console.error("Error downloading file:", err);
    return res.status(500).json({ message: "Error downloading file", error: err.message });
  }
};

// Approve completed work file
const approveCompletedWork = async (req, res) => {
  try {
    const { Id } = req.params;
    
    // Update the order to mark file as approved AND set status to completed
    const [result] = await database_pool.query(
      'UPDATE orders SET file_approved = TRUE, file_disapproved = FALSE, Status = "completed" WHERE Id = ?',
      [Id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

       const [order] = await database_pool.query(
            'SELECT Freelancer_Id FROM orders WHERE Id = ?',
            [Id]
        );
        
        if (order && order.length > 0) {
            // Create notification for the freelancer
            await createNotification(
                order[0].Freelancer_Id,
                'order_approved',
                'Work Approved',
                'A client has approved your work. Check your orders page for details.',
                Id
            );
        }

    return res.status(200).json({ 
      message: "Work approved successfully and order marked as completed"
    });
  } catch (err) {
    console.error("Error approving work:", err);
    return res.status(500).json({ message: "Error approving work", error: err.message });
  }
};

// Disapprove completed work file
const disapproveCompletedWork = async (req, res) => {
  try {
    const { Id } = req.params;
    const { feedback } = req.body;
    
    // Update the order to mark file as disapproved and set status back to in_progress
    const [result] = await database_pool.query(
      'UPDATE orders SET file_disapproved = TRUE, file_approved = FALSE, Status = "in_progress", feedback = ? WHERE Id = ?',
      [feedback || "Work needs revisions", Id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const [order] = await database_pool.query(
            'SELECT Freelancer_Id FROM orders WHERE Id = ?',
            [Id]
        );
        
        if (order && order.length > 0) {
            // Create notification for the freelancer
            await createNotification(
                order[0].Freelancer_Id,
                'order_revision',
                'Revision Requested',
                'A client has requested revisions for your work. Check your orders page for details.',
                Id
            );
        }

    return res.status(200).json({ 
      message: "Work marked for revision and sent back to freelancer"
    });
  } catch (err) {
    console.error("Error disapproving work:", err);
    return res.status(500).json({ message: "Error disapproving work", error: err.message });
  }
};

export { 
  createOrder, 
  getClientOrders, 
  getFreelancerOrders, 
  updateOrderStatus, 
  uploadCompletedWork, 
  downloadCompletedWork, 
  approveCompletedWork,
  disapproveCompletedWork
}; 