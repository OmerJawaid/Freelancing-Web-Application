import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/Authcontext';
import Navbar from '../../Components/Navbar Client/Navbar';
import Footer from '../../Components/Footer/Footer';
import './Orders.css';
import { FaClock, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaSpinner } from 'react-icons/fa';

const ClientOrders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!user || !user.id) {
          setError("You must be logged in to view orders");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:8081/orders/client", {
          params: { User_Id: user.id },
          withCredentials: true
        });

        setOrders(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again later.");
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Function to get package name based on Type
  const getPackageNameByType = (type) => {
    switch (Number(type)) {
      case 1: return "Basic";
      case 2: return "Standard";
      case 3: return "Premium";
      default: return "Package";
    }
  };

  // Function to render status with appropriate icon
  const renderStatus = (status) => {
    switch (status) {
      case 'pending':
        return (
          <div className="status pending">
            <FaClock /> Pending Verification
          </div>
        );
      case 'approved':
        return (
          <div className="status approved">
            <FaCheckCircle /> Approved
          </div>
        );
      case 'in_progress':
        return (
          <div className="status in-progress">
            <FaSpinner /> In Progress
          </div>
        );
      case 'completed':
        return (
          <div className="status completed">
            <FaCheckCircle /> Completed
          </div>
        );
      case 'rejected':
        return (
          <div className="status rejected">
            <FaTimesCircle /> Rejected
          </div>
        );
      default:
        return (
          <div className="status unknown">
            <FaHourglassHalf /> {status}
          </div>
        );
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="orders-page">
        <Navbar />
        <div className="loading">Loading your orders...</div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <Navbar />
        <div className="error-message">{error}</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="orders-page">
      <Navbar />
      <div className="orders-container">
        <h1>My Orders</h1>
        
        {orders.length === 0 ? (
          <div className="no-orders">
            <h3>You don't have any orders yet</h3>
            <p>Browse gigs and place your first order!</p>
            <button 
              className="browse-gigs-button"
              onClick={() => window.location.href = '/client-dashboard'}
            >
              Browse Gigs
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.Id} className="order-card">
                <div className="order-image">
                  <img 
                    src={order.Image || "https://dummyimage.com/300x200/e9ecef/495057&text=Gig+Image"} 
                    alt={order.Title} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://dummyimage.com/300x200/e9ecef/495057&text=Gig+Image";
                    }}
                  />
                </div>
                <div className="order-details">
                  <h3 className="order-title">{order.Title}</h3>
                  <div className="order-freelancer">
                    <img 
                      src={order.FreelancerImage || "https://dummyimage.com/50/e9ecef/495057&text=User"} 
                      alt={order.FreelancerName} 
                      className="freelancer-avatar"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://dummyimage.com/50/e9ecef/495057&text=User";
                      }}
                    />
                    <span>{order.FreelancerName}</span>
                  </div>
                  <div className="order-info">
                    <div className="order-date">
                      Ordered on: {formatDate(order.Created_At)}
                    </div>
                    <div className="order-package">
                      Package: {getPackageNameByType(order.Type)}
                    </div>
                    <div className="order-price">
                      Price: ${order.Price || 0}
                    </div>
                  </div>
                  <div className="order-status">
                    {renderStatus(order.Status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ClientOrders; 