import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/Authcontext';
import Navbar from '../../Components/Navbar Client/Navbar';
import Footer from '../../Components/Footer/Footer';
import './Orders.css';
import { FaClock, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaSpinner, FaDownload, FaFile, FaThumbsUp, FaThumbsDown, FaTimes, FaStar } from 'react-icons/fa';
import ReviewForm from '../../components/ReviewForm/ReviewForm';
import io from 'socket.io-client';

const ClientOrders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
  
  // Reference to socket.io connection
  const socketRef = useRef(null);

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
  
  // Set up real-time order updates with socket.io
  useEffect(() => {
    if (!user || !user.id) return;
    
    // Create socket connection
    const socket = io('http://localhost:8081', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });
    
    // Store socket in ref
    socketRef.current = socket;
    
    // Connect and join order updates room
    socket.on('connect', () => {
      console.log('Socket connected for order updates');
      
      // Join order updates room with user ID
      socket.emit('join_order_updates', { userId: user.id });
    });
    
    // Handle join confirmation
    socket.on('order_updates_joined', (data) => {
      console.log('Joined order updates room successfully', data);
    });
    
    // Listen for order status changes
    socket.on('order_status_change', (data) => {
      console.log('✅ CLIENT: Order status changed event received:', data);
      
      // Update local state with the new status
      setOrders(prevOrders => {
        console.log('Current orders before update:', prevOrders);
        const updatedOrders = prevOrders.map(order => {
          if (order.Id === parseInt(data.orderId)) {
            console.log(`Updating order ${order.Id} status from ${order.Status} to ${data.status}`);
            return { ...order, Status: data.status };
          }
          return order;
        });
        console.log('Updated orders:', updatedOrders);
        return updatedOrders;
      });
    });
    
    // Clean up on component unmount
    return () => {
      console.log('Disconnecting socket for order updates');
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
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

  // Function to handle file download
  const handleFileDownload = async (orderId) => {
    try {
      setActionLoading(orderId);
      
      // Get the file as a blob
      const response = await axios.get(`http://localhost:8081/orders/download/${orderId}`, {
        responseType: 'blob', // Important for handling file downloads
        withCredentials: true
      });

      // Check if response is valid and has content
      if (!response.data || response.data.size === 0) {
        throw new Error("Empty file received or file not found");
      }

      // Get content type from response
      const contentType = response.headers['content-type'];
      
      // Create a blob with the correct MIME type for ZIP
      const blob = new Blob([response.data], { type: contentType || 'application/zip' });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = url;
      
      // Try to get the filename from the content-disposition header
      const contentDisposition = response.headers['content-disposition'];
      let filename = `order-${orderId}-completed-work.zip`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^";\n]*)"/i);
        if (filenameMatch && filenameMatch.length >= 2) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename); 
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error(`Error downloading file for order ${orderId}:`, err);
      alert("Failed to download file. The file may not exist or there was a server error.");
    } finally {
      setActionLoading(null);
    }
  };

  // Function to approve completed work
  const handleApproveWork = async (orderId) => {
    try {
      setActionLoading(orderId);
      
      const response = await axios.put(`http://localhost:8081/orders/approve/${orderId}`, {}, {
        withCredentials: true
      });

      if (response.data && response.data.message) {
        // Update the local state to reflect the approval and change status to completed
        setOrders(orders.map(order => 
          order.Id === orderId ? { ...order, file_approved: true, Status: 'completed' } : order
        ));
        alert('Work has been approved successfully! The order is now marked as completed.');
      }
    } catch (err) {
      console.error(`Error approving work for order ${orderId}:`, err);
      alert("Failed to approve work. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  // Function to open feedback modal for disapproving work
  const openDisapproveModal = (orderId) => {
    setCurrentOrderId(orderId);
    setFeedbackText('');
    setShowFeedbackModal(true);
  };

  // Function to disapprove completed work with feedback
  const handleDisapproveWork = async () => {
    if (!currentOrderId) return;
    
    try {
      setActionLoading(currentOrderId);
      
      const response = await axios.put(`http://localhost:8081/orders/disapprove/${currentOrderId}`, {
        feedback: feedbackText
      }, {
        withCredentials: true
      });

      if (response.data && response.data.message) {
        // Update the local state to reflect the disapproval and change status back to in_progress
        setOrders(orders.map(order => 
          order.Id === currentOrderId ? { 
            ...order, 
            file_disapproved: true, 
            file_approved: false, 
            Status: 'in_progress',
            feedback: feedbackText
          } : order
        ));
        alert('Work has been sent back to the freelancer for revisions.');
        setShowFeedbackModal(false);
      }
    } catch (err) {
      console.error(`Error disapproving work for order ${currentOrderId}:`, err);
      alert("Failed to disapprove work. Please try again.");
    } finally {
      setActionLoading(null);
      setCurrentOrderId(null);
    }
  };

  // Function to handle review submission
  const handleReviewSubmitted = (reviewData) => {
    // Update the local orders state to mark the order as reviewed
    setOrders(orders.map(order => 
      order.Id === selectedOrderForReview ? { ...order, Reviewed: true } : order
    ));
    
    // Hide the review form
    setShowReviewForm(false);
    setSelectedOrderForReview(null);
    
    // Show success message
    alert('Thank you for your review! Your feedback helps other clients make informed decisions.');
  };

  // Function to open the review form for a specific order
  const openReviewForm = (orderId) => {
    setSelectedOrderForReview(orderId);
    setShowReviewForm(true);
  };

  // Function to close the review form
  const closeReviewForm = () => {
    setShowReviewForm(false);
    setSelectedOrderForReview(null);
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

  // Render action buttons for client based on order status and file presence
  const renderActionButtons = (order) => {
    if (actionLoading === order.Id) {
      return (
        <div className="action-buttons">
          <button className="loading-button" disabled>
            <FaSpinner className="spinner" /> Processing...
          </button>
        </div>
      );
    }

    // Show download/approve buttons when file is uploaded
    if (order.file_path) {
      return (
        <div className="action-buttons client-actions">
          <button 
            className="download-button"
            onClick={() => handleFileDownload(order.Id)}
          >
            <FaDownload /> Download Completed Work (ZIP)
          </button>
          
          {!order.file_approved && (
            <>
              <div className="approval-buttons">
                <button 
                  className="approve-button"
                  onClick={() => handleApproveWork(order.Id)}
                >
                  <FaThumbsUp /> Approve Work
                </button>
                <button 
                  className="disapprove-button"
                  onClick={() => openDisapproveModal(order.Id)}
                >
                  <FaThumbsDown /> Request Revisions
                </button>
              </div>
              <div className="file-instructions">
                <small>*Approving this work will mark the order as officially completed.</small>
              </div>
            </>
          )}
          
          {order.file_approved && !order.Reviewed && (
            <div className="review-prompt">
              <div className="approved-message">
                <FaCheckCircle /> You've approved this work
              </div>
              <button 
                className="review-button"
                onClick={() => openReviewForm(order.Id)}
              >
                <FaStar /> Leave a Review
              </button>
              <div className="file-instructions">
                <small>*Your review helps others find quality freelancers.</small>
              </div>
            </div>
          )}
          
          {order.file_approved && order.Reviewed && (
            <div className="approved-message">
              <FaCheckCircle /> You've approved and reviewed this work
            </div>
          )}
        </div>
      );
    }

    // Show notification if work was disapproved and is waiting for resubmission
    if (order.Status === 'in_progress' && order.file_disapproved) {
      return (
        <div className="action-buttons">
          <div className="disapproved-message">
            <FaTimesCircle /> You've requested revisions from the freelancer
          </div>
          {order.feedback && (
            <div className="feedback-display">
              <strong>Your feedback:</strong>
              <p>{order.feedback}</p>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  // Feedback Modal Component
  const FeedbackModal = () => {
    if (!showFeedbackModal) return null;
    
    // Create a ref for the textarea to maintain focus
    const textareaRef = useRef(null);
    
    // Focus the textarea when the modal opens
    useEffect(() => {
      if (showFeedbackModal && textareaRef.current) {
        // Short timeout to ensure the DOM is ready
        setTimeout(() => {
          textareaRef.current.focus();
        }, 50);
      }
    }, [showFeedbackModal]);

    // Handle text change while preserving focus and cursor position
    const handleTextChange = (e) => {
      const cursorPosition = e.target.selectionStart;
      const cursorEnd = e.target.selectionEnd;
      
      setFeedbackText(e.target.value);
      
      // Use requestAnimationFrame to wait for the next browser paint cycle
      requestAnimationFrame(() => { 
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(cursorPosition, cursorEnd);
        }
      });
    };
    
    return (
      <div className="modal-overlay">
        <div 
          className="feedback-modal"
          // Prevent clicks on the modal from causing focus loss
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3>Request Revisions</h3>
            <button className="close-button" onClick={() => setShowFeedbackModal(false)}>
              <FaTimes />
            </button>
          </div>
          <div className="modal-body">
            <p>Please provide feedback for the freelancer to help them make necessary revisions:</p>
            <textarea 
              ref={textareaRef}
              value={feedbackText}
              onChange={handleTextChange}
              placeholder="Describe what needs to be improved or fixed..."
              rows={5}
              autoFocus
              // Prevent any potential click events from removing focus
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="modal-footer">
            <button className="cancel-button" onClick={() => setShowFeedbackModal(false)}>
              Cancel
            </button>
            <button 
              className="submit-button" 
              onClick={handleDisapproveWork}
              disabled={!feedbackText.trim()}
            >
              Submit Feedback
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Review Modal Component
  const ReviewFormModal = () => {
    if (!showReviewForm) return null;
    
    return (
      <div className="modal-overlay">
        <div className="review-modal">
          <div className="modal-header">
            <button className="close-button" onClick={closeReviewForm}>
              <FaTimes />
            </button>
          </div>
          <div className="review-modal-body">
            <ReviewForm 
              orderId={selectedOrderForReview} 
              onReviewSubmitted={handleReviewSubmitted} 
            />
          </div>
        </div>
      </div>
    );
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
                    {order.Status === 'completed' && order.file_path && (
                      <div className="file-available">
                        <FaFile /> Completed work available
                      </div>
                    )}
                    {order.Status === 'in_progress' && order.file_path && !order.file_disapproved && (
                      <div className="file-available">
                        <FaFile /> Work submitted for review
                      </div>
                    )}
                    {order.Status === 'in_progress' && order.file_disapproved && (
                      <div className="file-revision">
                        <FaTimesCircle /> Revisions requested
                      </div>
                    )}
                  </div>
                  {renderActionButtons(order)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <FeedbackModal />
      <ReviewFormModal />
      <Footer />
    </div>
  );
};

export default ClientOrders; 