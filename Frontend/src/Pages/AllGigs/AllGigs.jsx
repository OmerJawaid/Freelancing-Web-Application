import React, { useEffect, useState, useContext } from 'react';
import './AllGigs.css';
import Navbar from '../../Components/Navbar Client/Navbar';
import axios from 'axios';
import Footer from '../../Components/Footer/Footer';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/Authcontext';
import { FaSearch, FaPlus, FaEye, FaPause, FaPlay, FaEdit, FaStar } from 'react-icons/fa';

// Default images for fallbacks - using more reliable sources
const DEFAULT_GIG_IMAGE = "https://dummyimage.com/600x400/e9ecef/495057&text=Gig+Image";

// GigImage component for handling image loading with fallbacks
const GigImage = ({ src, alt, className }) => {
  const [imgSrc, setImgSrc] = useState(src || DEFAULT_GIG_IMAGE);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    // Update the image source if it changes
    if (src && src !== imgSrc && !hasError) {
      setImgSrc(src);
    }
  }, [src, imgSrc, hasError]);
  
  const handleError = () => {
    console.log('Image failed to load:', imgSrc);
    setHasError(true);
    setImgSrc(DEFAULT_GIG_IMAGE);
  };
  
  return (
    <img 
      src={imgSrc} 
      alt={alt || 'Gig Image'}
      className={className}
      onError={handleError}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
};

const AllGigs = () => {
  const [gigs, setGigs] = useState([]);
  const [filteredGigs, setFilteredGigs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [animatingGigId, setAnimatingGigId] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [isFiltering, setIsFiltering] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Fetch gigs when component mounts
  useEffect(() => {
    fetchGigs();
  }, [user]);

  // Function to fetch gigs
  const fetchGigs = async () => {
    try {
      setIsLoading(true);
      // Ensure user exists and has an ID before fetching
      if (!user || !user.id) {
        console.log("User not authenticated or missing ID");
        setIsLoading(false);
        return;
      }
      
      console.log("Fetching gigs for freelancer ID:", user.id);
      
      const result = await axios.get('http://localhost:8081/gigs/retrieveGigForFreelancer', {
        params: { freelancer_Id: user.id }
      });
      
      if (!result.data) {
        console.log("Error in getting gigs data");
        setIsLoading(false);
        return;
      }
      
      console.log("Gigs fetched:", result.data);
      
      // Debug logging for image URLs
      if (result.data && result.data.length > 0) {
        console.log("First gig data:", result.data[0]);
        console.log("Image URL format:", result.data[0].Image);
      }
      
      // Sort gigs by creation date (newest first)
      const sortedGigs = result.data.sort((a, b) => {
        return new Date(b.Created_At || 0) - new Date(a.Created_At || 0);
      });
      
      setGigs(sortedGigs);
      setFilteredGigs(sortedGigs);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching gigs:", error);
      setIsLoading(false);
    }
  };

  // Function to handle filter button click with transition
  const handleFilterChange = (newFilter) => {
    if (newFilter === filterType) return;
    
    setIsFiltering(true);
    setFilterType(newFilter);
    
    // Apply filtering based on search query and filter type
    applyFilters(searchQuery, newFilter);
    
    // Remove filtering flag after animation completes
    setTimeout(() => {
      setIsFiltering(false);
    }, 400); // Match the duration of filterTransition animation
  };

  // Function to apply both search and status filters
  const applyFilters = (query, filter) => {
    let filtered = [...gigs];
    
    // Apply status filter first
    if (filter !== 'all') {
      filtered = filtered.filter(gig => {
        return filter === 'active' ? gig.State === 1 : gig.State === 0;
      });
    }
    
    // Then apply search filter if there's a query
    if (query.trim()) {
      filtered = filtered.filter(gig => 
        gig.Title.toLowerCase().includes(query.toLowerCase()) || 
        (gig.Description && gig.Description.toLowerCase().includes(query.toLowerCase())) ||
        (gig.Category && gig.Category.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    setFilteredGigs(filtered);
  };
  
  // Function to handle search
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Apply both filters
    applyFilters(query, filterType);
  };

  // Function to toggle gig state (active/paused)
  const toggleGigState = async (gigId, currentState) => {
    try {
      setAnimatingGigId(gigId);
      
      // Optimistic UI update
      setGigs(prevGigs => 
        prevGigs.map(gig => 
          gig.Id === gigId ? { ...gig, State: currentState === 1 ? 0 : 1 } : gig
        )
      );
      
      setFilteredGigs(prevGigs => 
        prevGigs.map(gig => 
          gig.Id === gigId ? { ...gig, State: currentState === 1 ? 0 : 1 } : gig
        )
      );
      
      // Send request to backend
      await axios.put(`http://localhost:8081/gigs/toggleState/${gigId}`, {
        state: currentState === 1 ? 0 : 1
      });
      
      console.log(`Gig ${gigId} state toggled from ${currentState} to ${currentState === 1 ? 0 : 1}`);
      
      // Clear animation after a delay
      setTimeout(() => {
        setAnimatingGigId(null);
      }, 500);
    } catch (error) {
      console.error("Error toggling gig state:", error);
      
      // Revert optimistic update on error
      setGigs(prevGigs => 
        prevGigs.map(gig => 
          gig.Id === gigId ? { ...gig, State: currentState } : gig
        )
      );
      
      setFilteredGigs(prevGigs => 
        prevGigs.map(gig => 
          gig.Id === gigId ? { ...gig, State: currentState } : gig
        )
      );
      
      setAnimatingGigId(null);
    }
  };

  // No longer needed - GigImage component handles this

  return (
    <div className="all-gigs-page">
      <Navbar />
      
      <div className="all-gigs-container">
        <div className="all-gigs-header">
          <div className="header-left">
            <h1>My Gigs</h1>
            <div className="search-section">
              <div className="search-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search your gigs by title, description or category..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="search-input"
                />
              </div>
              <div className="gigs-count">
                {filteredGigs.length} {filteredGigs.length === 1 ? 'Gig' : 'Gigs'}
              </div>
            </div>
          </div>
          <div className="gigs-actions">
            <div className="filter-buttons">
              <button 
                className={`filter-button ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => handleFilterChange('all')}
              >
                All
              </button>
              <button 
                className={`filter-button ${filterType === 'active' ? 'active' : ''}`}
                onClick={() => handleFilterChange('active')}
              >
                Active
              </button>
              <button 
                className={`filter-button ${filterType === 'paused' ? 'active' : ''}`}
                onClick={() => handleFilterChange('paused')}
              >
                Paused
              </button>
            </div>
            <button 
              className="create-new-gig-btn"
              onClick={() => navigate('/create-gig')}
            >
              <FaPlus /> Create New Gig
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your gigs...</p>
          </div>
        ) : filteredGigs.length === 0 ? (
          <div className="no-gigs-message">
            {searchQuery ? (
              <>
                <h3>No gigs match your search</h3>
                <p>Try a different search term or clear your search</p>
                <button 
                  className="clear-search-button"
                  onClick={() => {
                    setSearchQuery('');
                    setFilteredGigs(gigs);
                  }}
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <h3>You don't have any gigs yet</h3>
                <p>Create your first gig to start offering your services to clients</p>
                <button 
                  className="create-gig-button"
                  onClick={() => navigate('/create-gig')}
                >
                  <FaPlus /> Create New Gig
                </button>
              </>
            )}
          </div>
        ) : (
          <div 
            className="gigs-grid"
            data-filtering={isFiltering}
          >
            {filteredGigs.map((gig) => (
              <div 
                key={gig.Id} 
                className={`gig-card ${animatingGigId === gig.Id ? 'state-transition' : ''}`}
              >
                <div className="gig-image">
                  <GigImage 
                    src={gig.Image} 
                    alt={gig.Title} 
                  />
                  <div className={`status-badge ${gig.State === 1 ? 'active' : 'paused'}`}>
                    {gig.State === 1 ? 'Active' : 'Paused'}
                  </div>
                </div>
                
                <div className="gig-details">
                  <h3 className="gig-title" title={gig.Title}>{gig.Title}</h3>
                  
                  <div className="gig-meta">
                    <span className="gig-category">{gig.Category || 'Uncategorized'}</span>
                  </div>
                  
                  <p className="gig-description" title={gig.Description}>
                    {gig.Description ? 
                      (gig.Description.length > 120 
                        ? gig.Description.substring(0, 120).trim() + '...' 
                        : gig.Description)
                      : "No description available"}
                  </p>
                  
                  <div className="gig-stats" style={{borderTop: 'none', borderBottom: 'none', boxShadow: 'none'}}>
                    <div className="stat">
                      <FaEye className="stat-icon" />
                      <span className="stat-value">{gig.Views || 0}</span>
                      <span className="stat-label">Views</span>
                    </div>
                    <div className="stat">
                      <FaStar className="stat-icon" />
                      <span className="stat-value">{gig.Rating ? gig.Rating.toFixed(1) : 'New'}</span>
                      <span className="stat-label">Rating</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value price">${gig.BasicPrice || 0}</span>
                      <span className="stat-label">Starting at</span>
                    </div>
                  </div>
                  
                  <div className="gig-actions">
                    <button 
                      className="view-button"
                      onClick={() => navigate(`/client/${gig.Id}`)}
                      title="View Gig"
                    >
                      <FaEye /> View
                    </button>
                    <button 
                      className="edit-button"
                      onClick={() => navigate(`/edit-gig/${gig.Id}`)}
                      title="Edit Gig"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button 
                      className={gig.State === 1 ? 'pause-button' : 'activate-button'}
                      onClick={() => toggleGigState(gig.Id, gig.State)}
                      title={gig.State === 1 ? 'Pause Gig' : 'Activate Gig'}
                    >
                      {gig.State === 1 ? <><FaPause /> Pause</> : <><FaPlay /> Activate</>}
                    </button>
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

export default AllGigs;
