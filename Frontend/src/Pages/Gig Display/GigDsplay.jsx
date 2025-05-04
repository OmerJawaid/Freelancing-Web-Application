import React, { useEffect, useState, useRef } from 'react'
import './GigDisplay.css'
import { useParams } from 'react-router-dom';
import Navbar from '../../Components/Navbar Client/Navbar';
import { FaStar, FaClock, FaCheck, FaUser, FaEnvelope, FaShoppingCart, FaHeart, FaShare, FaQuoteLeft, FaChevronDown, FaChevronUp, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';

// Default images for fallbacks
const DEFAULT_GIG_IMAGE = "https://placehold.co/800x450/e9ecef/495057?text=Gig+Image";
const DEFAULT_USER_IMAGE = "https://placehold.co/100/e9ecef/495057?text=User";
const DEFAULT_REVIEW_IMAGE = "https://placehold.co/50/e9ecef/495057?text=User";

const Gig = () => {
  const { id } = useParams();
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
  const reviewsRef = useRef(null);
  
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
        "http://localhost:8081/retrive-packages-gigs-freelancer-by-gig-id", 
        { 
          params: { Gig_Id: gigId },
          withCredentials: true
        }
      );
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        setPackages(response.data);
        return true;
      } else {
        createMockPackages(gigId);
        return false;
      }
    } catch (err) {
      createMockPackages(gigId);
      return false;
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

  // Fetch reviews for a gig
  const fetchReviewsForGig = async (gigId) => {
    try {
      const response = await axios.get(
        "http://localhost:8081/retrive-reviews-gigs-freelancess-by-gig-id", 
        { 
          params: { Gig_Id: gigId },
          withCredentials: true
        }
      );
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        setReviews(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
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
    if (!imageUrl || !isValidUrl(imageUrl)) {
      return defaultImage;
    }
    return imageUrl;
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
            `http://localhost:8081/retrive-gig-by-id?Gig_Id=${id}`,
            { withCredentials: true }
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
            
            await fetchPackagesForGig(gigResponse.data.Id);
            await fetchReviewsForGig(gigResponse.data.Id);
            setLoading(false);
            return;
          }
        } catch (directFetchError) {
          console.log("Error fetching gig:", directFetchError);
          
          // If the gig is not found, try to fetch a sample gig
          if (directFetchError.response && directFetchError.response.status === 404) {
            console.log(`Gig with ID ${id} not found, trying to fetch sample gig`);
            try {
              const sampleGigResponse = await axios.get(
                `http://localhost:8081/retrive-gig-by-id?Gig_Id=1`,
                { withCredentials: true }
              );
              
              if (sampleGigResponse.data) {
                console.log("Sample gig data received:", sampleGigResponse.data);
                setGig(sampleGigResponse.data);
                setFreelancer({
                  Id: sampleGigResponse.data.Freelancer_Id,
                  Name: sampleGigResponse.data.freelancer_Name,
                  Bio: sampleGigResponse.data.freelancer_Bio,
                  Rating: sampleGigResponse.data.freelancer_Rating,
                  Image: sampleGigResponse.data.freelancer_Image,
                });
                
                await fetchPackagesForGig(sampleGigResponse.data.Id);
                await fetchReviewsForGig(sampleGigResponse.data.Id);
                setLoading(false);
                return;
              }
            } catch (sampleError) {
              console.log("Error fetching sample gig:", sampleError);
              setError("Could not find the requested gig or load a sample gig. Please try again later.");
              setLoading(false);
              return;
            }
          }
          
          // If direct fetch fails, try fetch by freelancer ID
          try {
            const gigsFromFreelancer = await axios.get(
              `http://localhost:8081/retrive-gigs-by-freelancer-id`,
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
              
              await fetchPackagesForGig(gigsFromFreelancer.data[0].Id);
              await fetchReviewsForGig(gigsFromFreelancer.data[0].Id);
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
        if (error.response && error.response.status === 404) {
          console.log(`Gig with ID ${id} not found in the database`);
          // Just set loading to false, don't set an error message
          // This will allow the component to reach the "if (!gig)" condition
          // which will display our nice "Gig Not Found" UI
          setLoading(false);
          return;
        } else {
          setError("Failed to load gig details. Please try again later.");
          
          // Try sample data as last resort
          try {
            const gigResponse = await axios.get(
              `http://localhost:8081/retrive-gig-by-id?Gig_Id=1`,
              { withCredentials: true }
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
              await fetchReviewsForGig(gigResponse.data.Id);
              setLoading(false);
              return;
            }
          } catch (sampleError) {
            // Continue to error state if sample data fails
          }
        }
        
        setLoading(false);
      }
    };
    
    fetchGigData();
  }, [id]);

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
                `http://localhost:8081/retrive-gig-by-id?Gig_Id=1`,
                { withCredentials: true }
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
                await fetchReviewsForGig(gigResponse.data.Id);
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
            cursor: "pointer",
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
                  `http://localhost:8081/retrive-gig-by-id?Gig_Id=1`,
                  { withCredentials: true }
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
                  await fetchReviewsForGig(gigResponse.data.Id);
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
                src={getSafeImageUrl(safeFreelancer.Image, DEFAULT_USER_IMAGE)} 
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
              <button style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                fontWeight: "500",
                cursor: "pointer",
                border: "1px solid #e5e7eb",
                backgroundColor: "white",
                color: "#ef4444",
                transition: "all 0.2s ease"
              }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#fee2e2"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "white"}>
                <FaHeart /> Save
              </button>
              <button style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                fontWeight: "500",
                cursor: "pointer",
                border: "1px solid #e5e7eb",
                backgroundColor: "white",
                color: "#1f2937",
                transition: "all 0.2s ease"
              }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "white"}>
                <FaShare /> Share
              </button>
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
            overflow: "hidden"
          }}>
            <div className="gig-gallery" style={{
              marginBottom: "0"
            }}>
              <div className="main-image" style={{
                width: "100%",
                height: "450px",
                overflow: "hidden",
                position: "relative"
              }}>
                <img 
                  src={getSafeImageUrl(gig.Image || gig.image, DEFAULT_GIG_IMAGE)} 
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

            <div className="gig-description" style={{
              padding: "2.5rem",
              borderBottom: "1px solid #eaeaea"
            }}>
              <h2 style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "1.25rem"
              }}>About This Gig</h2>
              
              {/* Render description with fallback options */}
              {(() => {
                console.log("Current gig state:", gig);
                
                if (!gig) {
                  console.log("Gig is null or undefined");
                  return (
                    <p style={{
                      color: "#4b5563",
                      lineHeight: "1.7",
                      fontSize: "1rem"
                    }}>
                      Loading description...
                    </p>
                  );
                }
                
                // Get description text with fallback
                const descriptionText = gig.Description;
                console.log("Description text being rendered:", descriptionText);
                
                if (!descriptionText) {
                  console.log("No description text found in gig object");
                  return (
                    <p style={{
                      color: "#4b5563",
                      lineHeight: "1.7",
                      fontSize: "1rem"
                    }}>
                      No description available for this gig.
                    </p>
                  );
                }
                
                // Handle both text with newlines and HTML content
                return (
                  <div 
                    style={{
                      color: "#4b5563",
                      lineHeight: "1.7",
                      fontSize: "1rem",
                      whiteSpace: "pre-wrap"
                    }}
                    dangerouslySetInnerHTML={{
                      __html: descriptionText.includes('<') && descriptionText.includes('>') 
                        ? descriptionText 
                        : descriptionText.replace(/\n/g, "<br/>")
                    }} 
                  />
                );
              })()}
            </div>

            <div className="freelancer-profile" style={{
              padding: "2.5rem",
              borderBottom: "1px solid #eaeaea",
              background: "linear-gradient(to right, #fcfcfc, #ffffff)"
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
                  src={getSafeImageUrl(safeFreelancer.Image, DEFAULT_USER_IMAGE)} 
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
              backgroundColor: '#f9f9f9'
            }}>
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
                    // Use a consistent object structure regardless of data format
                    const reviewData = {
                      title: review.Title || review.title || "Review",
                      description: review.Description || review.description || "No description provided",
                      rating: review.Rating || review.rating || 5,
                      clientName: review.client_Name || review.clientName || "Client",
                      clientImage: review.client_Image || review.clientImage || DEFAULT_REVIEW_IMAGE
                    };
                    
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
                                  src={getSafeImageUrl(reviewData.clientImage, DEFAULT_REVIEW_IMAGE)} 
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
                                {review.Date || review.date || "Recently"}
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
                <div className="no-reviews-message">
                  <p>No reviews yet. Be the first to leave a review!</p>
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
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#10b981"}>
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
                <strong style={{ fontWeight: "600", color: "#1f2937" }}>{gig.Views || gig.views || 0}</strong>
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
    </div>
  );
};

export default Gig;