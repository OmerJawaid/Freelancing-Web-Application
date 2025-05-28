import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/Authcontext';
import Navbar from '../../Components/Navbar Client/Navbar';
import Footer from '../../Components/Footer/Footer';
import { FaChartLine, FaStar, FaClipboardList, FaMoneyBillWave, FaSpinner, FaCheckCircle, FaClock } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './Dashboard.css';
import { getImageUrl, DEFAULT_USER_IMAGE } from '../../utils/imageUtils';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const FreelancerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    activeOrders: 0,
    totalEarnings: 0,
    averageRating: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        const ordersResponse = await axios.get("https://freelancing-web-application-production.up.railway.app/orders/freelancer", {
          params: { Freelancer_Id: user.id },
          withCredentials: true
        });

        const orders = ordersResponse.data;
        
        // Calculate statistics
        const completed = orders.filter(order => order.Status === 'completed').length;
        const active = orders.filter(order => order.Status === 'in_progress').length;
        const earnings = orders
          .filter(order => order.Status === 'completed')
          .reduce((total, order) => total + (order.Price || 0), 0);
        
        // Set statistics
        setStats({
          totalOrders: orders.length,
          completedOrders: completed,
          activeOrders: active,
          totalEarnings: earnings,
          averageRating: user.Rating || 0,
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

  // Chart data
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Monthly Earnings',
        data: [650, 590, 800, 810, 960, 1000],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Earnings Overview',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value;
          }
        }
      }
    }
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
              <p className="rating">
                <FaStar className="star-icon" /> {stats.averageRating.toFixed(1)} Rating
              </p>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <FaClipboardList />
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
              <h3>Total Earnings</h3>
              <p className="stat-value">{formatCurrency(stats.totalEarnings)}</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="chart-section">
            <div className="chart-container">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="recent-orders-section">
            <h2>Recent Orders</h2>
            <div className="recent-orders-list">
              {recentOrders.length === 0 ? (
                <p className="no-orders">No orders yet</p>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.Id} className="recent-order-card">
                    <img 
                      src={getImageUrl(order.ClientImage, DEFAULT_USER_IMAGE)}
                      alt={order.ClientName}
                      className="client-avatar"
                    />
                    <div className="order-info">
                      <h4>{order.Title}</h4>
                      <p className="client-name">Client: {order.ClientName}</p>
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
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FreelancerDashboard; 