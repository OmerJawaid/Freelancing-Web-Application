// Backend/controller/DashboardStats.js
import { database_pool as connection } from '../config/dbconnection.js';

/**
 * Calculate the total earnings for a freelancer
 * @param {Object} req - Request object with freelancerId parameter
 * @param {Object} res - Response object
 */
export const calculateTotalEarnings = async (req, res) => {
  const { freelancerId } = req.query;
  
  if (!freelancerId) {
    return res.status(400).json({ error: 'Freelancer ID is required' });
  }
  
  try {
    // Get all completed orders for this freelancer
    const [completedOrders] = await connection.execute(
      `SELECT o.Package_Id 
       FROM orders o
       WHERE o.Freelancer_Id = ? AND o.Status = 'completed'`,
      [freelancerId]
    );
    
    if (!completedOrders || completedOrders.length === 0) {
      return res.json({ totalEarnings: 0 });
    }
    
    // Get package prices and calculate total earnings
    let totalEarnings = 0;
    
    // Create an array of package IDs for the query
    const packageIds = completedOrders.map(order => order.Package_Id);
    
    // Get prices for all packages in a single query
    const [packageResults] = await connection.execute(
      `SELECT ID, Price FROM packages WHERE ID IN (${packageIds.map(() => '?').join(',')})`,
      packageIds
    );
    
    // Create a map of package ID to price for quick lookup
    const packagePrices = {};
    packageResults.forEach(pkg => {
      packagePrices[pkg.ID] = pkg.Price;
    });
    
    // Calculate total earnings by summing the prices of all completed orders
    completedOrders.forEach(order => {
      const packagePrice = packagePrices[order.Package_Id] || 0;
      totalEarnings += packagePrice;
    });
    
    // Return the total earnings
    return res.json({ totalEarnings });
  } catch (error) {
    console.error('Error calculating total earnings:', error);
    return res.status(500).json({ error: 'Failed to calculate total earnings' });
  }
}

/**
 * Get comprehensive dashboard statistics for a freelancer
 * @param {Object} req - Request object with freelancerId parameter
 * @param {Object} res - Response object
 */
export const getFreelancerStats = async (req, res) => {
  const { freelancerId } = req.query;
  
  if (!freelancerId) {
    return res.status(400).json({ error: 'Freelancer ID is required' });
  }
  
  try {
    // Get all orders for this freelancer with creation dates
    const [allOrders] = await connection.execute(
      `SELECT o.Status, o.Package_Id, o.Created_At
       FROM orders o
       WHERE o.Freelancer_Id = ?`,
      [freelancerId]
    );
    
    // Calculate stats
    const activeOrders = allOrders.filter(order => order.Status === 'in_progress').length;
    const completedOrders = allOrders.filter(order => order.Status === 'completed').length;
    const totalOrders = allOrders.length;
    
    // Calculate completion rate (if there are any orders)
    const completionRate = totalOrders > 0 
      ? Math.round((completedOrders / totalOrders) * 100) 
      : 100; // Default to 100% if no orders yet
    
    // Get all completed orders with their creation dates
    const completedOrdersWithDates = allOrders.filter(order => order.Status === 'completed');
    
    // Get package prices for completed orders
    let totalEarnings = 0;
    
    // Monthly earnings data
    const monthlyData = {};
    const monthlyOrderCounts = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize last 6 months data with zeros
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (today.getMonth() - i + 12) % 12; // Handle year wraparound
      const monthKey = monthNames[monthIndex];
      monthlyData[monthKey] = 0;
      monthlyOrderCounts[monthKey] = 0;
    }
    
    if (completedOrders > 0) {
      // Get completed orders' package IDs
      const completedOrderPackageIds = completedOrdersWithDates.map(order => order.Package_Id);
      
      // Get prices for all completed order packages
      const [packageResults] = await connection.execute(
        `SELECT ID, Price FROM packages WHERE ID IN (${completedOrderPackageIds.map(() => '?').join(',')})`,
        completedOrderPackageIds
      );
      
      // Create a map of package ID to price
      const packagePrices = {};
      packageResults.forEach(pkg => {
        packagePrices[pkg.ID] = pkg.Price;
      });
      
      // Calculate total earnings and gather monthly data
      completedOrdersWithDates.forEach(order => {
        const orderPrice = packagePrices[order.Package_Id] || 0;
        totalEarnings += orderPrice;
        
        // Add to monthly data if within last 6 months
        if (order.Created_At) {
          const orderDate = new Date(order.Created_At);
          const orderMonth = monthNames[orderDate.getMonth()];
          
          // Check if this month is in our tracked months (last 6 months)
          if (orderMonth in monthlyData) {
            monthlyData[orderMonth] += orderPrice;
            monthlyOrderCounts[orderMonth] += 1;
          }
        }
      });
    }
    
    // Get average rating
    const [ratingResults] = await connection.execute(
      `SELECT AVG(Rating) as avgRating
       FROM reviews
       WHERE Freelancer_Id = ?`,
      [freelancerId]
    );
    
    const avgRating = ratingResults[0]?.avgRating || 0;
    
    // Convert monthly data to arrays for the frontend
    const monthLabels = Object.keys(monthlyData);
    const monthlyEarnings = monthLabels.map(month => monthlyData[month]);
    const ordersByMonth = monthLabels.map(month => monthlyOrderCounts[month]);
    
    // Return all dashboard stats
    return res.json({
      totalEarnings,
      activeOrders,
      completionRate,
      avgRating: parseFloat(avgRating).toFixed(1),
      monthLabels,
      monthlyEarnings,
      ordersByMonth
    });
  } catch (error) {
    console.error('Error fetching freelancer stats:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
}
