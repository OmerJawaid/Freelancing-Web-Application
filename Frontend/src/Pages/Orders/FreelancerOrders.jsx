import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/Authcontext';
import Navbar from '../../Components/Navbar Client/Navbar';
import Footer from '../../Components/Footer/Footer';
import './Orders.css';
import { FaClock, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaSpinner, FaCheck, FaTimes, FaPlay } from 'react-icons/fa';

const FreelancerOrders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!user || !user.id) {
          setError("You must be logged in to view orders");
          setLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:8081/orders/freelancer", {
          params: { Freelancer_Id: user.id },
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

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdateLoading(orderId);
      const response = await axios.put(`http://localhost:8081/orders/status/${orderId}`, {
        Status: newStatus
      }, { withCredentials: true });

      if (response.data && response.data.message) {
        // Update the local state to reflect the change
        setOrders(orders.map(order => 
          order.Id === orderId ? { ...order, Status: newStatus } : order
        ));
      }
    } catch (err) {
      console.error(`Error updating order ${orderId} status:`, err);
      alert("Failed to update order status. Please try again.");
    } finally {
      setUpdateLoading(null);
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

  // Render action buttons based on the order status
  const renderActionButtons = (order) => {
    if (updateLoading === order.Id) {
      return (
        <div className="action-buttons">
          <button className="loading-button" disabled>
            <FaSpinner className="spinner" /> Updating...
          </button>
        </div>
      );
    }

    switch (order.Status) {
      case 'pending':
        return (
          <div className="action-buttons">
            <button 
              className="approve-button"
              onClick={() => handleStatusUpdate(order.Id, 'approved')}
            >
              <FaCheck /> Approve
            </button>
            <button 
              className="reject-button"
              onClick={() => handleStatusUpdate(order.Id, 'rejected')}
            >
              <FaTimes /> Reject
            </button>
          </div>
        );
      case 'approved':
        return (
          <div className="action-buttons">
            <button 
              className="start-button"
              onClick={() => handleStatusUpdate(order.Id, 'in_progress')}
            >
              <FaPlay /> Start Work
            </button>
          </div>
        );
      case 'in_progress':
        return (
          <div className="action-buttons">
            <button 
              className="complete-button"
              onClick={() => handleStatusUpdate(order.Id, 'completed')}
            >
              <FaCheckCircle /> Mark as Completed
            </button>
          </div>
        );
      case 'completed':
        return (
          <div className="action-buttons">
            <span className="status-message completed">
              <FaCheckCircle /> Completed
            </span>
          </div>
        );
      case 'rejected':
        return (
          <div className="action-buttons">
            <span className="status-message rejected">
              <FaTimesCircle /> Rejected
            </span>
          </div>
        );
      default:
        return null;
    }
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
        <h1>Manage Orders</h1>
        
        {orders.length === 0 ? (
          <div className="no-orders">
            <h3>You don't have any orders yet</h3>
            <p>Once clients place orders for your gigs, they will appear here.</p>
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
                  <div className="order-client">
                    <img 
                      src={order.ClientImage || "https://dummyimage.com/50/e9ecef/495057&text=User"} 
                      alt={order.ClientName} 
                      className="client-avatar"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://dummyimage.com/50/e9ecef/495057&text=User";
                      }}
                    />
                    <span>Client: {order.ClientName}</span>
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
                  {renderActionButtons(order)}
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

export default FreelancerOrders; 