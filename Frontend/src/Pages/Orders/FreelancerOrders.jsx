import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/Authcontext';
import Navbar from '../../Components/Navbar Client/Navbar';
import Footer from '../../Components/Footer/Footer';
import './Orders.css';
import { FaClock, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaSpinner, FaCheck, FaTimes, FaPlay, FaUpload, FaFile } from 'react-icons/fa';

const FreelancerOrders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(null);
  const fileInputRef = useRef(null);

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

  // Function to handle file upload
  const handleFileUpload = async (orderId, file) => {
    if (!file) return;

    // Verify file is a zip file
    if (!file.name.toLowerCase().endsWith('.zip')) {
      alert('Only ZIP files are allowed. Please compress your work into a ZIP file and try again.');
      return;
    }

    const formData = new FormData();
    formData.append('completedWork', file);

    try {
      setUploadLoading(orderId);
      
      // Show uploading message
      const fileSize = (file.size / (1024 * 1024)).toFixed(2);
      const uploadMessage = document.createElement('div');
      uploadMessage.className = 'upload-progress-message';
      uploadMessage.innerHTML = `<p>Uploading ${file.name} (${fileSize} MB)...</p>`;
      document.body.appendChild(uploadMessage);

      const response = await axios.post(
        `http://localhost:8081/orders/upload/${orderId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );

      if (response.data && response.data.message) {
        // Update the local state to reflect the file upload
        setOrders(orders.map(order => 
          order.Id === orderId ? { ...order, file_path: response.data.filePath, file_uploaded_at: new Date() } : order
        ));
        
        // Remove upload message
        document.body.removeChild(uploadMessage);
        
        // Show success message with more details
        const successMessage = document.createElement('div');
        successMessage.className = 'upload-success-message';
        successMessage.innerHTML = `
          <div class="success-content">
            <div class="success-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
              </svg>
            </div>
            <h3>File Uploaded Successfully!</h3>
            <p>Your file "${file.name}" has been uploaded.</p>
            <p>The client will be notified to review your work.</p>
            <button class="close-btn">OK</button>
          </div>
        `;
        document.body.appendChild(successMessage);
        
        // Add event listener to close button
        const closeBtn = successMessage.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
          document.body.removeChild(successMessage);
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
          if (document.body.contains(successMessage)) {
            document.body.removeChild(successMessage);
          }
        }, 5000);
      }
    } catch (err) {
      console.error(`Error uploading file for order ${orderId}:`, err);
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert("Failed to upload file. Only ZIP files are accepted.");
      }
      
      // Remove upload message if it exists
      const uploadMessage = document.querySelector('.upload-progress-message');
      if (uploadMessage) {
        document.body.removeChild(uploadMessage);
      }
    } finally {
      setUploadLoading(null);
    }
  };

  // Function to trigger file input click
  const triggerFileInput = (orderId) => {
    fileInputRef.current.click();
    fileInputRef.current.setAttribute('data-order-id', orderId);
  };

  // Function to handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    const orderId = fileInputRef.current.getAttribute('data-order-id');
    if (file && orderId) {
      handleFileUpload(orderId, file);
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

    if (uploadLoading === order.Id) {
      return (
        <div className="action-buttons">
          <button className="loading-button" disabled>
            <FaSpinner className="spinner" /> Uploading...
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
            {order.file_disapproved ? (
              <>
                <div className="disapproved-message">
                  <FaTimesCircle /> Revisions Requested by Client
                </div>
                {order.feedback && (
                  <div className="feedback-display">
                    <strong>Client Feedback:</strong>
                    <p>{order.feedback}</p>
                  </div>
                )}
                <button 
                  className="upload-button"
                  onClick={() => triggerFileInput(order.Id)}
                >
                  <FaUpload /> Upload Revised Work (ZIP only)
                </button>
                <div className="file-instructions">
                  <small>*Please address the client's feedback before resubmitting.</small>
                </div>
              </>
            ) : order.file_path ? (
              <>
                <div className="file-uploaded">
                  <FaFile /> File Uploaded {order.file_uploaded_at && `on ${formatDate(order.file_uploaded_at)}`}
                </div>
                <button 
                  className="upload-button"
                  onClick={() => triggerFileInput(order.Id)}
                >
                  <FaUpload /> Replace File (ZIP only)
                </button>
                <div className="waiting-for-approval">
                  <FaHourglassHalf /> Waiting for Client Approval
                </div>
                <div className="file-instructions">
                  <small>*The client will review your work and approve it to complete the order.</small>
                </div>
              </>
            ) : (
              <>
                <button 
                  className="upload-button"
                  onClick={() => triggerFileInput(order.Id)}
                >
                  <FaUpload /> Upload Completed Work (ZIP only)
                </button>
                <div className="file-instructions">
                  <small>*Please compress your work into a ZIP file before uploading.</small>
                </div>
              </>
            )}
          </div>
        );
      case 'completed':
        return (
          <div className="action-buttons">
            <span className="status-message completed">
              <FaCheckCircle /> Completed
            </span>
            {order.file_path && (
              <div className="file-uploaded">
                <FaFile /> File Uploaded {order.file_uploaded_at && `on ${formatDate(order.file_uploaded_at)}`}
              </div>
            )}
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
        
        {/* Hidden file input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileSelect}
          accept=".zip,application/zip,application/x-zip-compressed"
        />
        
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