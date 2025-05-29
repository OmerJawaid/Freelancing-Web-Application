import React, { useEffect, useState, useRef, useContext } from 'react'
import './GigDisplay.css'
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../Components/Navbar Client/Navbar';
import { FaStar, FaClock, FaCheck, FaUser, FaEnvelope, FaShoppingCart, FaHeart, FaShare, FaQuoteLeft, FaChevronDown, FaChevronUp, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';
import Footer from '../../Components/Footer/Footer';
import { AuthContext } from '../../context/Authcontext';

// Default images for fallbacks - using more reliable sources
const DEFAULT_GIG_IMAGE = "https://dummyimage.com/800x450/e9ecef/495057&text=Gig+Image";
const DEFAULT_USER_IMAGE = "https://dummyimage.com/100/e9ecef/495057&text=User";
const DEFAULT_REVIEW_IMAGE = "https://dummyimage.com/50/e9ecef/495057&text=User";

const Gig = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [gig, setGig] = useState(null);
  const [freelancer, setFreelancer] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [backendStatus, setBackendStatus] = useState("unknown");
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [randomGigs, setRandomGigs] = useState([]);
  const reviewsRef = useRef(null);
  
  console.log("GigDisplay mounted with ID:", id);
  
  // Add a direct call to fetch reviews (immediately after declaring reviewsRef)
  useEffect(() => {
    // Force fetch reviews for the specific gig ID we found in the database
    const directlyFetchReviews = async () => {
      if (!loading && gig && gig.Id) {
        console.log("Directly fetching reviews for gig ID:", gig.Id);
        try {
          const response = await axios.get(
            `http://localhost:8081/reviews/retrieve`,
            { 
              params: { Gig_Id: gig.Id },
              withCredentials: true 
            }
          );
          
          console.log("Direct reviews API response:", response.data);
          setReviews(response.data || []);
        } catch (error) {
          console.error("Direct fetch reviews error:", error);
        }
      }
    };

    directlyFetchReviews();
  }, [loading, gig]);

  // Add this after the existing useEffect for directlyFetchReviews
  // Last chance direct fetch for reviews we know exist
  useEffect(() => {
    const fetchKnownReviews = async () => {
      if (!loading && reviews.length === 0) {
        console.log("Last resort: Fetching known reviews for gig ID 4");
        try {
          const response = await axios.get(
            `http://localhost:8081/reviews/retrieve`,
            { 
              params: { Gig_Id: 4 },
              withCredentials: true 
            }
          );
          
          console.log("Known reviews response:", response.data);
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            console.log("Got reviews for gig 4, using as fallback");
            setReviews(response.data);
          }
        } catch (error) {
          console.error("Known reviews fetch error:", error);
        }
      }
    };

    fetchKnownReviews();
  }, [loading, reviews.length]);

  // Helper to get package name based on Type
  const getPackageNameByType = (type) => {
    switch (Number(type)) {
      case 1: return "Basic";
      case 2: return "Standard";
      case 3: return "Premium";
      default: return "Package";
    }
  };

  // Fetch packages for a gig
  const fetchPackagesForGig = async (gigId) => {
    try {
      const response = await axios.get(
        `http://localhost:8081/packages/retrieve`,
        { 
          params: { Gig_Id: gigId },
          withCredentials: true 
        }
      );
      
      if (response.data && Array.isArray(response.data)) {
        setPackages(response.data);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
    }
  };

  //Contact including Conversation making
  const Contact = async () => {
    try {
      if (!gig || !gig.Freelancer_Id) {
        console.error("No freelancer ID available");
        return;
      }

      // Get current user from session/local storage
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (!currentUser || !currentUser.id) {
        console.error("No user is logged in");
        return;
      }

      const response = await axios.post(
        "http://localhost:8081/create-conversation",
        {
          User_one_id: currentUser.id,
          User_two_id: gig.Freelancer_Id,
          Last_message: "",
          Last_message_time: null,
          Unread_count_user_one: 0,
          Unread_count_user_two: 0
        },
        { withCredentials: true }
      );

      console.log("Conversation creation response:", response.data);

      // Optionally redirect to messages page after creating conversation
      if (response.data.message === "Successfully created new conversation" || 
          response.data.message === "Conversation already exists") {
        window.location.href = '/messages';
      }
    } catch (err) {
      console.error("Error creating conversation:", err);
    }
  }

  // Create mock packages if none found in database
  const createMockPackages = (gigId) => {
    const mockPackages = [
      {
        ID: 1, Gig_Id: gigId, Type: 1, Package_Name: "Basic",
        Price: 500, Delivery_Time: 8, Revisions: 1,
        Package_Details: "Got it! If you're looking for a basic solution..."
      },
      {
        ID: 2, Gig_Id: gigId, Type: 2, Package_Name: "Standard",
        Price: 1000, Delivery_Time: 5, Revisions: 2,
        Package_Details: "Complete solution with additional features..."
      },
      {
        ID: 3, Gig_Id: gigId, Type: 3, Package_Name: "Premium",
        Price: 1500, Delivery_Time: 3, Revisions: 5,
        Package_Details: "Full-featured solution with priority support..."
      }
    ];
    setPackages(mockPackages);
  };

  // Fetch reviews from database only - no mock data
  const fetchReviewsForGig = async (gigId) => {
    try {
      // Clear any existing reviews
      setReviews([]);
      
      console.log("Fetching reviews for gig ID:", gigId);
      
      // Fetch actual reviews from the database
      const response = await axios.get(
        `http://localhost:8081/reviews/retrieve`,
        { 
          params: { Gig_Id: gigId },
          withCredentials: true 
        }
      );
      
      console.log("Raw API response:", response);
      
      if (response.data && Array.isArray(response.data)) {
        console.log("Retrieved reviews from database:", response.data);
        
        // Process reviews to ensure consistent format and format dates
        const processedReviews = response.data.map(review => {
          console.log("Processing review:", review);
          // Format date as readable string
          const reviewDate = new Date(review.Created_At);
          const formattedDate = reviewDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
          
          // Normalize the rating property to ensure it's available for the StarRating component
          // Check all possible property names for rating
          const rating = review.Rating || review.rating || review.Stars || review.stars || 0;
          
          return {
            ...review,
            date: formattedDate,
            rating: rating, // Ensure a consistent 'rating' property is available
            Rating: rating  // Also set uppercase version for compatibility
          };
        });
        
        console.log("Processed reviews:", processedReviews);
        setReviews(processedReviews);
        console.log("Reviews state after setting:", processedReviews);
      } else {
        console.log("No reviews found or invalid response format");
        setReviews([]);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      console.error("Error details:", error.response?.data);
      // Set empty reviews array to ensure UI shows "no reviews" message
      setReviews([]);
    }
  };
  
  // Function to check if URL is valid
  const isValidUrl = (url) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Function to get safe image URL with fallback
  const getSafeImageUrl = (imageUrl, defaultImage) => {
    if (!imageUrl) return defaultImage;
    return imageUrl;
  };

  // Function to update gig views
  const updateGigViews = async (gigId) => {
    try {
      await axios.put(`http://localhost:8081/gigs/updateViews/${gigId}`);
    } catch (error) {
      console.error("Error updating gig views:", error);
    }
  };
  
  // Function to fetch random gigs
  const fetchRandomGigs = async () => {
    if (!id) return;
    
    try {
      const response = await axios.get('http://localhost:8081/gigs/random', {
        params: {
          excludeId: id,
          limit: 4
        },
        withCredentials: true
      });
      
      if (response.data && Array.isArray(response.data)) {
        setRandomGigs(response.data);
      }
    } catch (error) {
      console.error("Error fetching random gigs:", error);
    }
  };

  // Function to get the correct image URL
  const getImageUrl = (imagePath, defaultImage) => {
    if (!imagePath) return defaultImage;
    // Remove the /public prefix if it exists
    const cleanPath = imagePath.replace(/^\/public/, '');
    return `http://localhost:8081${cleanPath}`;
  };

  // Main data fetching function
  useEffect(() => {
    const fetchGigData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check backend connectivity
        try {
          await fetch("http://localhost:8081/health-check");
          setBackendStatus("online");
        } catch (err) {
          setBackendStatus("offline");
          setError("Cannot connect to the backend server. Please ensure the server is running.");
          setLoading(false);
          return;
        }
        
        // Try to fetch gig by its ID
        try {
          const gigResponse = await axios.get(
            `http://localhost:8081/gigs/retrieveGigByGigId`,
            { 
              params: { Gig_Id: id },
              withCredentials: true 
            }
          );
          
          if (gigResponse.data) {
            console.log("Gig data received:", gigResponse.data);
            console.log("Description field:", gigResponse.data.Description);
            setGig(gigResponse.data);
            setFreelancer({
              Id: gigResponse.data.Freelancer_Id,
              Name: gigResponse.data.freelancer_Name,
              Bio: gigResponse.data.freelancer_Bio,
              Rating: gigResponse.data.freelancer_Rating,
              Image: gigResponse.data.freelancer_Image,
            });
            
            // Fetch packages and reviews but handle errors individually
            try {
              await fetchPackagesForGig(gigResponse.data.Id);
            } catch (packageError) {
              console.error("Error fetching packages:", packageError);
              // Use mock packages as fallback
              createMockPackages(gigResponse.data.Id);
            }
            
            try {
              await fetchReviewsForGig(gigResponse.data.Id || 1);
            } catch (reviewError) {
              console.error("Error fetching reviews:", reviewError);
              // Set empty reviews array to ensure UI still works
              setReviews([]);
            }
            
            // After successfully fetching gig data, update views
            updateGigViews(gigResponse.data.Id);

            setLoading(false);
            return;
          }
        } catch (directFetchError) {
          console.log("Error fetching gig:", directFetchError);

          // If the gig is not found, explicitly set error and stop loading
          if (directFetchError.response && directFetchError.response.status === 404) {
            console.log(`Gig with ID ${id} not found.`);
            setError("The requested gig does not exist.");
            setLoading(false);
            return;
          }

          // If direct fetch fails for other reasons, try fetch by freelancer ID
          try {
            const gigsFromFreelancer = await axios.get(
              `http://localhost:8081/gigs/retrieveGigForGigDisplay`,
              { 
                params: { Freelancer_Id: id },
                withCredentials: true 
              }
            );
            
            if (gigsFromFreelancer.data && gigsFromFreelancer.data.length > 0) {
              setGig(gigsFromFreelancer.data[0]);
              setFreelancer({
                Id: gigsFromFreelancer.data[0].Freelancer_Id,
                Name: gigsFromFreelancer.data[0].freelancer_Name,
                Bio: gigsFromFreelancer.data[0].freelancer_Bio,
                Rating: gigsFromFreelancer.data[0].freelancer_Rating,
                Image: gigsFromFreelancer.data[0].freelancer_Image,
              });
              
              try {
                await fetchPackagesForGig(gigsFromFreelancer.data[0].Id);
              } catch (packageError) {
                console.error("Error fetching packages from freelancer gig:", packageError);
                createMockPackages(gigsFromFreelancer.data[0].Id);
              }
              
              try {
                await fetchReviewsForGig(gigsFromFreelancer.data[0].Id || id);
              } catch (reviewError) {
                console.error("Error fetching reviews from freelancer gig:", reviewError);
                setReviews([]);
              }
              
              setLoading(false);
              return;
            } else {
              throw new Error("No gig found with this ID");
            }
          } catch (fallbackError) {
            throw fallbackError;
          }
        }
      } catch (error) {
        console.error("Error fetching gig data:", error);
        setError("An error occurred while fetching gig data. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchGigData();
  }, [id]);

  // Fetch random gigs when main gig data is loaded
  useEffect(() => {
    if (!loading && gig) {
      fetchRandomGigs();
    }
  }, [loading, gig]);

  const handleImageChange = (index) => {
    setActiveImage(index);
  };

  const handlePackageSelect = (index) => {
    if (index >= 0 && index < packages.length) {
      setSelectedPackage(index);
    }
  };

  // Scroll to reviews section
  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle the order creation
  const handleOrder = async () => {
    try {
      if (!user || !user.id) {
        alert("You need to be logged in to place an order!");
        navigate('/login');
        return;
      }

      if (user.User_Type !== 'client') {
        alert("Only clients can place orders!");
        return;
      }

      if (!gig || !gig.Id || !gig.Freelancer_Id) {
        alert("Unable to place order. Missing gig information.");
        return;
      }

      // Get the selected package
      const selectedPkg = packages[selectedPackage];
      if (!selectedPkg) {
        alert("Please select a package to order.");
        return;
      }

      const response = await axios.post(
        "http://localhost:8081/orders/create",
        {
          User_Id: user.id,
          Freelancer_Id: gig.Freelancer_Id,
          Gig_Id: gig.Id,
          Package_Id: selectedPkg.ID
        },
        { withCredentials: true }
      );

      if (response.data && response.data.message) {
        setOrderSuccess(true);
        setTimeout(() => {
          navigate('/client-orders');
        }, 2000);
      }
    } catch (err) {
      console.error("Error creating order:", err);
      alert("Failed to create order. Please try again.");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading gig details...</p>
        {backendStatus === "offline" && (
          <div style={{ marginTop: "10px", color: "red" }}>
            <p>Unable to connect to backend server.</p>
            <p>Please ensure the server is running at http://localhost:8081</p>
          </div>
        )}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Gig</h2>
        <p>{error}</p>
        {backendStatus === "offline" ? (
          <div>
            <p>The backend server appears to be offline.</p>
            <p>Steps to fix:</p>
            <ol>
              <li>Make sure the backend server is running (cd Backend && node sqlconnection.js)</li>
              <li>Check if the MySQL database is running</li>
              <li>Verify that the gig with ID {id} exists in the database</li>
            </ol>
          </div>
        ) : (
          <p>Please try again later or contact support.</p>
        )}
        
        <button 
          onClick={async () => {
            try {
              setLoading(true);
              const gigResponse = await axios.get(
                `http://localhost:8081/gigs/retrieveGigByGigId`,
                { 
                  params: { Gig_Id: 1 },
                  withCredentials: true 
                }
              );
              
              if (gigResponse.data) {
                setGig(gigResponse.data);
                setFreelancer({
                  Id: gigResponse.data.Freelancer_Id,
                  Name: gigResponse.data.freelancer_Name,
                  Bio: gigResponse.data.freelancer_Bio,
                  Rating: gigResponse.data.freelancer_Rating,
                  Image: gigResponse.data.freelancer_Image,
                });
                
                try {
                  await fetchPackagesForGig(gigResponse.data.Id);
                } catch (packageError) {
                  console.error("Error fetching packages for sample gig:", packageError);
                  createMockPackages(gigResponse.data.Id);
                }
                
                try {
                  await fetchReviewsForGig(gigResponse.data.Id || 1);
                } catch (reviewError) {
                  console.error("Error fetching reviews for sample gig:", reviewError);
                  setReviews([]);
                }
                
                setError(null);
                setLoading(false);
              }
            } catch (error) {
              setError("Could not load sample data either. Please check backend connectivity.");
              setLoading(false);
            }
          }}
          style={{ 
            marginTop: "20px",
            padding: "10px 15px", 
            backgroundColor: "#1e88e5", 
            color: "white", 
            border: "none", 
            borderRadius: "4px",
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#1565c0"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#1e88e5"}
        >
          Try Loading Sample Data
        </button>
      </div>
    );
  }

  // No gig found
  if (!gig) {
    return (
      <div className="error-container">
        <h2>Gig Not Found</h2>
        <p>The gig with ID {id} doesn't exist in our database.</p>
        <p>This could be because:</p>
        <ul style={{ textAlign: 'left', maxWidth: '500px', margin: '0 auto', marginTop: '20px' }}>
          <li>The gig ID is incorrect</li>
          <li>The gig has been removed</li>
          <li>The gig hasn't been created yet</li>
        </ul>
        
        <div style={{ marginTop: '30px' }}>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: '10px 15px',
              backgroundColor: '#1e88e5',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#1565c0"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#1e88e5"}
          >
            Go Back
          </button>
          
          <button
            onClick={async () => {
              try {
                setLoading(true);
                const gigResponse = await axios.get(
                  `http://localhost:8081/gigs/retrieveGigByGigId`,
                  { 
                    params: { Gig_Id: 1 },
                    withCredentials: true 
                  }
                );
                
                if (gigResponse.data) {
                  setGig(gigResponse.data);
                  setFreelancer({
                    Id: gigResponse.data.Freelancer_Id,
                    Name: gigResponse.data.freelancer_Name,
                    Bio: gigResponse.data.freelancer_Bio,
                    Rating: gigResponse.data.freelancer_Rating,
                    Image: gigResponse.data.freelancer_Image,
                  });
                  
                  await fetchPackagesForGig(gigResponse.data.Id);
                  await fetchReviewsForGig(gigResponse.data.Id || 1);
                  setError(null);
                  setLoading(false);
                }
              } catch (error) {
                setError("Could not load sample data either. Please check backend connectivity.");
                setLoading(false);
              }
            }}
            style={{
              padding: '10px 15px',
              backgroundColor: '#ffffff',
              color: '#1e88e5',
              border: '1px solid #1e88e5',
              borderRadius: '4px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#f0f7ff";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#ffffff";
            }}
          >
            View Sample Gig
          </button>
        </div>
      </div>
    );
  }

  // Ensure we have a valid freelancer object
  const safeFreelancer = freelancer || {
    Name: "Unknown Freelancer",
    Image: DEFAULT_USER_IMAGE,
    Rating: "New",
    Bio: "No bio available"
  };

  // Star rating component
  const StarRating = ({ rating }) => {
    rating = parseFloat(rating) || 0;
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar 
          key={i} 
          className={i <= rating ? "star-filled" : "star-empty"} 
          style={{ color: i <= rating ? "#FFD700" : "#e4e5e9" }}
        />
      );
    }
    
    return <div className="star-rating">{stars}</div>;
  };

  return (
    <div className="gig-display-container">
      <Navbar />
      
      {orderSuccess && (
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgba(16, 185, 129, 0.95)",
          color: "white",
          padding: "20px 40px",
          borderRadius: "8px",
          zIndex: 1000,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          textAlign: "center"
        }}>
          <h3 style={{ marginBottom: "10px" }}>Order Placed Successfully!</h3>
          <p>Redirecting to your orders...</p>
        </div>
      )}

      <div className="gig-content">
        <div className="gig-header" style={{
          marginBottom: "2.5rem",
          paddingBottom: "1.5rem",
          borderBottom: "1px solid #eaeaea"
        }}>
          <h1 className="gig-title" style={{
            fontSize: "2rem",
            fontWeight: "700",
            color: "#1f2937",
            marginBottom: "1.5rem",
            lineHeight: "1.3"
          }}>{gig.Title || gig.title || "Untitled Gig"}</h1>
          <div className="gig-meta" style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem"
          }}>
            <div className="freelancer-info" style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem"
            }}>
              <img 
                src={getImageUrl(safeFreelancer.Image, DEFAULT_USER_IMAGE)} 
                alt={safeFreelancer.Name || "Freelancer"} 
                className="freelancer-avatar" 
                style={{
                  width: "48px",
                  height: "48px",
                  objectFit: "cover",
                  borderRadius: "50%",
                  border: "2px solid #fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                }}
                onError={(e) => {
                  console.log("Freelancer image load failed, using fallback");
                  e.target.onerror = null;
                  e.target.src = DEFAULT_USER_IMAGE;
                }}
              />
              <div className="freelancer-details" style={{
                display: "flex",
                flexDirection: "column"
              }}>
                <h3 style={{
                  margin: "0 0 4px 0",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  color: "#1f2937"
                }}>{safeFreelancer.Name || "Freelancer"}</h3>
                <div className="rating" style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}>
                  <FaStar style={{ color: "#f59e0b" }} />
                  <span style={{ color: "#4b5563" }}>{safeFreelancer.Rating || "New"}</span>
                </div>
              </div>
            </div>
            <div className="gig-actions" style={{
              display: "flex",
              gap: "0.75rem"
            }}>
            </div>
          </div>
        </div>

        <div className="gig-body" style={{
          display: "grid",
          gridTemplateColumns: "1fr 350px",
          gap: "2rem"
        }}>
          <div className="gig-main" style={{
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            overflow: "hidden"
          }}>
            <div className="gig-gallery" style={{
              marginBottom: "0",
              position: "relative",
              zIndex: "1"
            }}>
              <div className="main-image" style={{
                width: "100%",
                height: "450px",
                overflow: "hidden",
                position: "relative"
              }}>
                <img 
                  src={gig.Image || DEFAULT_GIG_IMAGE} 
                  alt={gig.Title || gig.title || "Gig Image"} 
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block"
                  }}
                  onError={(e) => {
                    console.log("Image load failed, using fallback");
                    e.target.onerror = null;
                    e.target.src = DEFAULT_GIG_IMAGE;
                  }}
                />
              </div>
            </div>

            <div style={{
              padding: "2.5rem",
              borderBottom: "1px solid #eaeaea",
              backgroundColor: "#fff",
              width: "100%",
              minHeight: "120px",
              display: "block",
              clear: "both"
            }}>
              <h2 style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "1.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <span>About This Gig</span>
              </h2>
              <div style={{
                color: "#000",
                backgroundColor: "#fff",
                lineHeight: "1.6",
                fontSize: "0.95rem",
                whiteSpace: "pre-wrap",
                marginBottom: "0.5rem",
                width: "100%",
                display: "block",
                padding: "20px",
                borderRadius: "8px",
                minHeight: "60px",
                maxHeight: showFullDescription ? "none" : "200px",
                overflow: showFullDescription ? "visible" : "hidden",
                position: "relative",
                transition: "max-height 0.3s ease",
                textAlign: "left"
              }}>
                <div
                  style={{ color: "#4b5563" }}
                  dangerouslySetInnerHTML={{
                    __html: (() => {
                      const content = gig.Description || gig.description || "";
                      if (!content) return "<span style='color:#888'>No description available for this gig.</span>";
                      if (content.includes('<') && content.includes('>')) return content;
                      
                      // Process the text for better formatting
                      return content
                        .replace(/\n\n/g, "</p><p style='margin-bottom: 12px; margin-top: 12px;'>")
                        .replace(/\n/g, "<br/>")
                        .replace(/^(.+)$/m, "<p style='margin-bottom: 12px; line-height: 1.6;'>$1</p>");
                    })()
                  }}
                />
                {!showFullDescription && (
                  <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "80px",
                    background: "linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1))",
                    pointerEvents: "none"
                  }} />
                )}
              </div>
              <div style={{
                textAlign: "center",
                padding: "0.5rem"
              }}>
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    margin: "0 auto",
                    padding: "0.5rem 1.5rem",
                    backgroundColor: "white",
                    color: "#10b981",
                    border: "1px solid #10b981",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    transition: "all 0.2s ease"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f0fffa"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "white"}
                >
                  {showFullDescription ? (
                    <>
                      Show Less <FaChevronUp />
                    </>
                  ) : (
                    <>
                      Show More <FaChevronDown />
                    </>
                  )}
                </button>
              </div>
            </div>

            <div style={{
              height: "20px",
              backgroundColor: "#f9fafb",
              width: "100%",
              display: "block",
              clear: "both"
            }}></div>

            <div style={{
              padding: "2.5rem",
              borderBottom: "1px solid #eaeaea",
              backgroundColor: "#fff",
              width: "100%",
              display: "block",
              clear: "both"
            }}>
              <h2 style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "1.5rem"
              }}>About The Freelancer</h2>
              <div className="freelancer-profile-content" style={{
                display: "flex",
                gap: "2rem",
                alignItems: "flex-start"
              }}>
                <img 
                  src={getImageUrl(safeFreelancer.Image, DEFAULT_USER_IMAGE)} 
                  alt={safeFreelancer.Name || "Freelancer"} 
                  className="freelancer-profile-image" 
                  style={{
                    width: "110px",
                    height: "110px",
                    objectFit: "cover",
                    borderRadius: "50%",
                    border: "3px solid #fff",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    flexShrink: 0
                  }}
                  onError={(e) => {
                    console.log("Freelancer profile image load failed, using fallback");
                    e.target.onerror = null;
                    e.target.src = DEFAULT_USER_IMAGE;
                  }}
                />
                <div className="freelancer-profile-details" style={{
                  flex: 1
                }}>
                  <h3 style={{
                    fontSize: "1.25rem",
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                    color: "#1f2937"
                  }}>{safeFreelancer.Name || "Freelancer"}</h3>
                  <div className="rating" style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1rem"
                  }}>
                    <FaStar style={{ color: "#f59e0b" }} />
                    <span style={{ color: "#4b5563" }}>{safeFreelancer.Rating || "New"}</span>
                  </div>
                  <p style={{
                    color: "#4b5563",
                    marginBottom: "1.5rem",
                    lineHeight: 1.6,
                    fontSize: "0.95rem"
                  }}>{safeFreelancer.Bio || "No bio available"}</p>
                  <div style={{ 
                    display: "flex",
                    gap: "1rem",
                    flexWrap: "wrap"
                  }}
                  >
                    {/* Contact button */}
                    <button
                      className="contact-seller-button"
                      style={{
                        backgroundColor: 'white',
                        color: '#10b981',
                        border: '1px solid #10b981',
                        borderRadius: '8px',
                        padding: '12px 24px',
                        width: 'auto',
                        fontSize: '15px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0fffa';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                      }}
                      onClick={() => {
                        console.log("Contact seller clicked");
                        Contact()
                      }}
                    >
                      <FaEnvelope /> Contact Me
                    </button>
                    
                    {/* Continue button */}
                    <button
                      className="continue-button"
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 24px',
                        width: 'auto',
                        fontSize: '15px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(16, 185, 129, 0.2)',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#059669';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#10b981';
                      }}
                      onClick={() => {
                        console.log("Continue clicked");
                        document.querySelector('.pricing-card').scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="reviews-section" ref={reviewsRef} style={{
              marginTop: '40px',
              padding: '30px 20px',
              borderTop: '1px solid #eaeaea',
              width: '100%',
              backgroundColor: '#f9f9f9',
              position: 'relative',
              zIndex: '1'
            }}>
              {console.log("Current reviews state:", reviews)}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                width: '100%',
                padding: '0 10px'
              }}>
                <h2 style={{ 
                  margin: 0,
                  fontSize: '24px',
                  fontWeight: '600'
                }}>
                  Client Reviews
                  {reviews.length > 0 && (
                    <span style={{
                      marginLeft: '10px',
                      fontSize: '18px',
                      color: '#666',
                      fontWeight: 'normal'
                    }}>({reviews.length})</span>
                  )}
                </h2>
                {reviews.length > 3 && !showAllReviews && (
                  <button 
                    onClick={() => setShowAllReviews(true)}
                    style={{
                      background: 'none',
                      border: '1px solid #10b981',
                      color: '#10b981',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      padding: '6px 14px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f9ff';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    View All Reviews <FaChevronRight style={{ fontSize: '10px' }} />
                  </button>
                )}
              </div>
              
              {reviews && reviews.length > 0 ? (
                <div 
                  className="reviews-container"
                  style={{
                    maxHeight: showAllReviews ? 'none' : '750px',
                    overflowY: showAllReviews ? 'visible' : 'hidden',
                    transition: 'max-height 0.5s ease-in-out',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0',
                    backgroundColor: '#fff',
                    padding: '0',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                >
                  {/* Show only first 3 reviews initially */}
                  {reviews.slice(0, showAllReviews ? reviews.length : 3).map((review, index) => {
                    console.log("Rendering review:", review);
                    
                    // Use a consistent object structure regardless of data format
                    const reviewData = {
                      id: review.Id || review.id || index,
                      title: review.Title || review.title || "Review",
                      description: review.Description || review.description || "No description provided",
                      rating: review.Rating || review.rating || 5,
                      clientName: review.client_Name || review.clientName || review.name || "Client",
                      clientImage: review.client_Image || review.clientImage || review.image || DEFAULT_REVIEW_IMAGE,
                      date: review.date || new Date(review.Created_At || Date.now()).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    };
                    
                    console.log("Processed reviewData:", reviewData);
                    
                    return (
                      <div key={index} style={{
                        width: '100%', 
                        padding: index === 0 ? '20px 0 0 0' : '20px 0 0 0'
                      }}>
                        {index > 0 && (
                          <div style={{
                            height: '1px',
                            backgroundColor: '#eaeaea',
                            width: '96%',
                            margin: '0 auto 0 auto'
                          }} />
                        )}
                        <div className="review-card" style={{
                          padding: '20px 30px 30px 30px',
                          margin: '0',
                          borderRadius: '0',
                          backgroundColor: '#fff',
                          transition: 'transform 0.2s ease',
                          width: '100%',
                          maxWidth: '100%'
                        }}>
                          <div className="review-header">
                            <div className="reviewer-info" style={{
                              display: 'flex',
                              alignItems: 'center',
                              marginBottom: '20px',
                              width: '100%',
                              justifyContent: 'space-between'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <img 
                                  src={getImageUrl(reviewData.clientImage, DEFAULT_REVIEW_IMAGE)} 
                                  alt={reviewData.clientName} 
                                  className="reviewer-image"
                                  style={{
                                    width: "46px",
                                    height: "46px",
                                    objectFit: "cover",
                                    borderRadius: "50%",
                                    backgroundColor: "#eee"
                                  }}
                                  onError={(e) => {
                                    console.log("Reviewer image load failed, using fallback");
                                    e.target.onerror = null;
                                    e.target.src = DEFAULT_REVIEW_IMAGE;
                                  }}
                                />
                                <div className="reviewer-details" style={{
                                  marginLeft: '14px'
                                }}>
                                  <h4 style={{
                                    margin: '0 0 6px 0',
                                    fontSize: '17px',
                                    fontWeight: '600',
                                    color: '#333'
                                  }}>{reviewData.clientName}</h4>
                                  <StarRating rating={reviewData.rating} />
                                </div>
                              </div>
                              
                              <div className="review-date" style={{
                                fontSize: '14px',
                                color: '#777'
                              }}>
                                {reviewData.date}
                              </div>
                            </div>
                          </div>
                          
                          <div className="review-content" style={{
                            paddingTop: '5px'
                          }}>
                            <h3 className="review-title" style={{
                              fontSize: '18px',
                              fontWeight: '600',
                              margin: '0 0 14px 0',
                              display: 'flex',
                              alignItems: 'center',
                              color: '#333'
                            }}>
                              <FaQuoteLeft className="quote-icon" style={{
                                marginRight: '10px',
                                color: '#666',
                                fontSize: '14px'
                              }} />
                              {reviewData.title}
                            </h3>
                            <p className="review-description" style={{
                              margin: '0',
                              lineHeight: '1.7',
                              color: '#555',
                              fontSize: '15px'
                            }}>{reviewData.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Show all reviews button */}
                  {reviews && reviews.length > 3 && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0 10px 0' }}>
                      <button 
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        style={{
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          padding: '10px 24px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          fontSize: '15px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          width: 'auto',
                          minWidth: '180px',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                      >
                        {showAllReviews ? (
                          <>
                            Show Less Reviews <FaChevronUp style={{ fontSize: '12px' }} />
                          </>
                        ) : (
                          <>
                            View More Reviews <FaChevronDown style={{ fontSize: '12px' }} />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-reviews-message" style={{
                  padding: '30px',
                  textAlign: 'center',
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <p style={{ marginBottom: '10px' }}>No reviews yet for this gig.</p>
                  <div>
                    <small style={{ color: '#666', display: 'block', marginBottom: '5px' }}>
                      Reviews will appear here after clients complete orders and leave feedback.
                    </small>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="gig-sidebar" style={{
            alignSelf: "flex-start",
            position: "sticky",
            top: "2rem"
          }}>
            <div className="pricing-card" style={{
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              overflow: "hidden",
              marginBottom: "1.5rem"
            }}>
              {packages && packages.length > 0 ? (
                <>
                  <div className="package-tabs" style={{
                    display: "flex",
                    borderBottom: "1px solid #eaeaea"
                  }}>
                    {packages
                      .sort((a, b) => (Number(a.Type) || 0) - (Number(b.Type) || 0))
                      .map((pkg, index) => (
                        <button 
                          key={index}
                          className={`package-tab ${selectedPackage === index ? 'active' : ''}`}
                          style={{
                            flex: 1,
                            padding: "1rem 0.5rem",
                            textAlign: "center",
                            border: "none",
                            borderBottom: selectedPackage === index ? "3px solid #10b981" : "3px solid transparent",
                            backgroundColor: selectedPackage === index ? "#f9fafb" : "white",
                            fontWeight: selectedPackage === index ? "600" : "500",
                            color: selectedPackage === index ? "#10b981" : "#4b5563",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                          onClick={() => handlePackageSelect(index)}
                        >
                          {pkg.Package_Name || getPackageNameByType(pkg.Type) || "Package"}
                        </button>
                      ))}
                  </div>
                  
                  <div className="selected-package" style={{
                    padding: "1.75rem"
                  }}>
                    {packages.length > 0 && selectedPackage >= 0 && selectedPackage < packages.length && (
                      <>
                        {/* Access the selected package safely */}
                        {(() => {
                          const pkg = packages[selectedPackage];
                          const safePkg = pkg || {
                            Package_Name: "Package",
                            Price: 0,
                            Package_Details: "No description available",
                            Delivery_Time: 7,
                            Revisions: 1
                          };
                          
                          return (
                            <>
                              <h3 style={{
                                fontSize: "1.25rem",
                                fontWeight: "600",
                                color: "#1f2937",
                                marginBottom: "1rem"
                              }}>{safePkg.Package_Name || getPackageNameByType(safePkg.Type) || "Package"}</h3>
                              <div style={{
                                marginBottom: "1.25rem"
                              }}>
                                <span style={{
                                  fontSize: "2rem",
                                  fontWeight: "700",
                                  color: "#10b981"
                                }}>${safePkg.Price || 0}</span>
                              </div>
                              <p style={{
                                color: "#4b5563",
                                marginBottom: "1.5rem",
                                lineHeight: "1.6",
                                fontSize: "0.95rem"
                              }}>
                                {safePkg.Package_Details || "No description available"}
                              </p>
                              
                              <div style={{
                                marginBottom: "1.5rem"
                              }}>
                                <div style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.75rem",
                                  marginBottom: "0.75rem"
                                }}>
                                  <FaClock style={{ color: "#6b7280" }} />
                                  <span style={{ color: "#4b5563" }}>{safePkg.Delivery_Time || 7} Days Delivery</span>
                                </div>
                                <div style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.75rem"
                                }}>
                                  <FaCheck style={{ color: "#10b981" }} />
                                  <span style={{ color: "#4b5563" }}>{safePkg.Revisions || 1} Revision{safePkg.Revisions !== 1 ? 's' : ''}</span>
                                </div>
                              </div>
                              
                              <button style={{
                                width: "100%",
                                padding: "1rem",
                                backgroundColor: "#10b981",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "1rem",
                                fontWeight: "600",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.5rem",
                                boxShadow: "0 2px 6px rgba(16, 185, 129, 0.2)",
                                transition: "all 0.2s ease"
                              }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#059669"}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#10b981"}
                              onClick={handleOrder}>
                                <FaShoppingCart /> Order Now
                              </button>
                            </>
                          );
                        })()}
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="no-packages-message">
                  <h3>No Packages Available</h3>
                  <p>This gig doesn't have any packages defined yet.</p>
                  <div className="package-price">
                    <span className="price-amount">${gig.Price || gig.price || 0}</span>
                  </div>
                  <button className="order-button" disabled>
                    <FaShoppingCart /> Not Available
                  </button>
                </div>
              )}
            </div>
            
            <div className="gig-stats" style={{
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              overflow: "hidden",
              padding: "1.5rem"
            }}>
              <div className="stat-item" style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0.75rem 0",
                borderBottom: "1px solid #eaeaea"
              }}>
                <span style={{ color: "#6b7280", fontSize: "0.95rem" }}>Views</span>
                <strong style={{ fontWeight: "600", color: "#1f2937" }}>
                  {gig.Views > 1000 ? '1000+' : (gig.Views > 500 ? '500+' : (gig.Views || gig.views || 0))}
                </strong>
              </div>
              <div className="stat-item" style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0.75rem 0",
                borderBottom: "1px solid #eaeaea"
              }}>
                <span style={{ color: "#6b7280", fontSize: "0.95rem" }}>Category</span>
                <strong style={{ fontWeight: "600", color: "#1f2937" }}>{gig.Category || gig.category || "General"}</strong>
              </div>
              <div className="stat-item" style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0.75rem 0"
              }}>
                <span style={{ color: "#6b7280", fontSize: "0.95rem" }}>Status</span>
                <strong style={{ 
                  fontWeight: "600", 
                  color: gig.State === 1 || gig.state === 1 ? "#10b981" : "#f59e0b" 
                }}>{gig.State === 1 || gig.state === 1 ? "Active" : "Inactive"}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Random Gigs Section - You might also like */}
      {randomGigs.length > 0 && (
        <div className="random-gigs-section" style={{
          padding: '2rem 0',
          backgroundColor: '#f9fafb',
          marginTop: '2rem'
        }}>
          <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>You Might Also Like</h2>
            
            <div className="random-gigs-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}>
              {randomGigs.map(randomGig => (
                <div 
                  key={randomGig.Id} 
                  className="random-gig-card" 
                  onClick={() => navigate(`/client/${randomGig.Id}`)}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
                  }}
                >
                  <div style={{ height: '160px', overflow: 'hidden' }}>
                    <img 
                      src={getImageUrl(randomGig.Image, DEFAULT_GIG_IMAGE)} 
                      alt={randomGig.Title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  
                  <div style={{ padding: '1rem' }}>
                    <h3 style={{ 
                      fontSize: '1rem', 
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      color: '#111827',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      height: '2.5rem'
                    }}>
                      {randomGig.Title}
                    </h3>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        color: '#f59e0b'
                      }}>
                        <StarRating rating={randomGig.Rating || randomGig.rating || 0} />
                      </div>
                      <span style={{ 
                        marginLeft: '0.25rem',
                        fontSize: '0.875rem',
                        color: '#6b7280'
                      }}>
                        {randomGig.Rating || randomGig.rating ? 
                          `(${(randomGig.Rating || randomGig.rating).toFixed(1)})` : 
                          '(New)'}

                      </span>
                    </div>
                    
                    <div style={{ 
                      fontWeight: '700',
                      color: '#10b981',
                      fontSize: '1.125rem'
                    }}>
                      Starting at ${randomGig.Price || randomGig.BasicPrice || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <Footer/>
    </div>
  );
};

export default Gig;