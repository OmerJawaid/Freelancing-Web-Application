import React, { useEffect, useState, useContext } from 'react';
import './Dashboard.css';
import Navbar from '../../Components/Navbar Client/Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Footer from '../../Components/Footer/Footer';
import defaultFreelancerImage from '../../assets/react.svg';
import { AuthContext } from '../../context/Authcontext';
import { FaShoppingBag, FaSpinner, FaCheckCircle, FaClock, FaMoneyBillWave, FaStar } from 'react-icons/fa';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { getImageUrl, DEFAULT_USER_IMAGE } from '../../utils/imageUtils';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const ClientDashboard = () => {
  const { user } = useContext(AuthContext);
  const [gigs, setgigs] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    activeOrders: 0,
    totalSpent: 0,
    reviewsGiven: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const result = await axios.get("https://freelancing-web-application-production.up.railway.app/gigs/retrieveAllGigs");
        setgigs(result.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchGigs();
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!user || !user.id) {
          setError("You must be logged in to view the dashboard");
          setLoading(false);
          return;
        }

        // Fetch orders
        const ordersResponse = await axios.get("https://freelancing-web-application-production.up.railway.app/orders/client", {
          params: { User_Id: user.id },
          withCredentials: true
        });

        const orders = ordersResponse.data;
        
        // Calculate statistics
        const completed = orders.filter(order => order.Status === 'completed').length;
        const active = orders.filter(order => order.Status === 'in_progress').length;
        const spent = orders
          .filter(order => order.Status === 'completed')
          .reduce((total, order) => total + (order.Price || 0), 0);
        const reviewsGiven = orders.filter(order => order.Reviewed).length;
        
        // Set statistics
        setStats({
          totalOrders: orders.length,
          completedOrders: completed,
          activeOrders: active,
          totalSpent: spent,
          reviewsGiven: reviewsGiven
        });

        // Set recent orders (last 5)
        setRecentOrders(orders.slice(0, 5));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Chart data for order status distribution
  const chartData = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [
      {
        data: [
          stats.completedOrders,
          stats.activeOrders,
          stats.totalOrders - (stats.completedOrders + stats.activeOrders)
        ],
        backgroundColor: [
          '#4caf50',
          '#2196f3',
          '#ffa726'
        ],
        borderWidth: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Order Status Distribution'
      }
    },
    cutout: '70%'
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const OpenGig=(id)=>{
    navigate(`/client/${id}`);
  }

  const getFreelancerImageUrl = (imagePath) => {
    if (!imagePath) return defaultFreelancerImage;
    // Remove the /public prefix if it exists
    const cleanPath = imagePath.replace(/^\/public/, '');
    return `https://freelancing-web-application-production.up.railway.app${cleanPath}`;
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <Navbar />
        <div className="loading">
          <FaSpinner className="spinner" /> Loading dashboard...
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <Navbar />
        <div className="error-message">{error}</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="profile-summary">
            <img 
              src={getImageUrl(user.Image, DEFAULT_USER_IMAGE)} 
              alt={user.Name}
              className="profile-image"
            />
            <div className="profile-info">
              <h1>Welcome back, {user.Name}!</h1>
              <p className="subtitle">Here's your order summary</p>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <FaShoppingBag />
            </div>
            <div className="stat-details">
              <h3>Total Orders</h3>
              <p className="stat-value">{stats.totalOrders}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FaCheckCircle />
            </div>
            <div className="stat-details">
              <h3>Completed</h3>
              <p className="stat-value">{stats.completedOrders}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FaClock />
            </div>
            <div className="stat-details">
              <h3>Active Orders</h3>
              <p className="stat-value">{stats.activeOrders}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FaMoneyBillWave />
            </div>
            <div className="stat-details">
              <h3>Total Spent</h3>
              <p className="stat-value">{formatCurrency(stats.totalSpent)}</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="recent-orders-section">
            <h2>Recent Orders</h2>
            <div className="recent-orders-list">
              {recentOrders.length === 0 ? (
                <p className="no-orders">No orders yet</p>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.Id} className="recent-order-card">
                    <img 
                      src={getImageUrl(order.FreelancerImage, DEFAULT_USER_IMAGE)}
                      alt={order.FreelancerName}
                      className="client-avatar"
                    />
                    <div className="order-info">
                      <h4>{order.Title}</h4>
                      <p className="freelancer-name">Freelancer: {order.FreelancerName}</p>
                      <p className="order-date">Ordered: {formatDate(order.Created_At)}</p>
                    </div>
                    <div className="order-price">
                      {formatCurrency(order.Price || 0)}
                    </div>
                    <div className={`order-status ${order.Status.toLowerCase()}`}>
                      {order.Status}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="chart-section">
            <div className="chart-container" style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Doughnut data={chartData} options={chartOptions} />
            </div>
            <div className="reviews-summary">
              <h3>Reviews Given</h3>
              <div className="reviews-stats">
                <FaStar className="star-icon" />
                <span>{stats.reviewsGiven} reviews</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ClientDashboard; 