import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import Navbar from '../../Components/Navbar Client/Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Footer from '../../Components/Footer/Footer';
import defaultFreelancerImage from '../../assets/react.svg';

const ClientDashboard = () => {

  const [gigs, setgigs]=useState([])
  const navigate= useNavigate();
  useEffect(()=>{
    const fetchGigs = async () => {
      try {
        const result = await axios.get("http://localhost:8081/gigs/retrieveAllGigs");
        setgigs(result.data);
       
      } catch (err) {
        console.error(err);
      }
    };

    fetchGigs();
  }, [])

  const categories = ["All", "Web Development", "Design", "Mobile Development", "Writing", "Marketing"];
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  const OpenGig=(id)=>{
    navigate(`/client/${id}`);
  }

  return (
    <div className="dashboard">
      <Navbar/>
      <div className="dashboard-content">
        
        {/* Sidebar with Filters */}
        <aside className="sidebar">
          <div className="filter-section">
            <h3>Categories</h3>
            {categories.map((category) => (
              <button
                key={category}
                className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="filter-section">
            <h3>Price Range</h3>
            <div className="price-filter">
              <input
                type="number"
                placeholder="Min Price"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                className="price-input"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                className="price-input"
              />
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="main-content">

          {/* Search Bar */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search for services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  // Prevent form submission if inside a form
                  e.preventDefault();
                  // Apply search (already handled by filter)
                }
              }}
            />
            <button 
              className="search-button"
              onClick={() => {
                // Search is applied automatically through the filter
                console.log("Search applied:", searchQuery);
              }}
            >
              Search
            </button>
          </div>

          {/* Gigs Grid */}
          <div className="gigs-grid">
            {
              (() => {
                const filteredGigs = gigs.filter((gig) => {
                  // Category filter
                  const categoryMatch = selectedCategory === 'All' || gig.Category === selectedCategory;
                  
                  // Price filter - properly parse the price value and handle empty inputs
                  const minPrice = priceRange.min ? parseFloat(priceRange.min) : null;
                  const maxPrice = priceRange.max ? parseFloat(priceRange.max) : null;
                  const gigPrice = gig.BasicPrice ? parseFloat(gig.BasicPrice) : 0;
                  
                  const priceMatch = (minPrice === null || gigPrice >= minPrice) &&
                                     (maxPrice === null || gigPrice <= maxPrice);
                  
                  // Search filter
                  const searchMatch = !searchQuery || 
                    gig.Title.toLowerCase().includes(searchQuery.toLowerCase());
                  
                  return categoryMatch && priceMatch && searchMatch;
                });

                if (filteredGigs.length === 0) {
                  return (
                    <div className="no-results">
                      <h3>No Gigs Found</h3>
                      <p>Try adjusting your filters or search query.</p>
                      {(priceRange.min || priceRange.max) && (
                        <p>Current price range: {priceRange.min || '0'} - {priceRange.max || 'any'}</p>
                      )}
                      <button 
                        className="reset-filters-button" 
                        onClick={() => {
                          setPriceRange({ min: "", max: "" });
                          setSearchQuery("");
                          setSelectedCategory("All");
                        }}
                      >
                        Reset Filters
                      </button>
                    </div>
                  );
                }

                return filteredGigs.map((gig) => (
                  <div key={gig.Id} className="gig-card">
                    <div className="gig-image">
                      <img 
                        src={gig.Image || defaultGigImage} 
                        alt={gig.Title} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = defaultGigImage;
                        }}
                      />
                    </div>
                    <div className="gig-details">
                      <h4 className="gig-title" title={gig.Title} style={{fontSize:"1.2rem",paddingTop:"0px"}}>{gig.Title}</h4>
                      <p className="gig-description" title={gig.Description}>
                        {gig.Description ? 
                          (gig.Description.length > 100 
                            ? gig.Description.substring(0, 100).trim() + '...' 
                            : gig.Description)
                          : "No description available"}
                      </p>
                      <div className="freelancer-info">
                        <img
                          src={gig.freelancerimage || defaultFreelancerImage}
                          alt={gig.Name}
                          className="freelancer-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = defaultFreelancerImage;
                          }}
                        />
                        <div className="freelancer-details">
                          <span className="freelancer-name">{gig.Name}</span>
                          <div className="rating">
                            <span className="stars">{'⭐'.repeat(Math.floor(gig.Rating))}</span>
                            <span className="rating-number">({gig.Rating})</span>
                          </div>
                        </div>
                      </div>
                      <div className="gig-footer">
                        <span className="price">
                          {gig.BasicPrice ? (
                            <>
                              ${gig.BasicPrice}
                              <span className="price-label">Starting at</span>
                            </>
                          ) : (
                            <>
                              ${gig.Price || 0}
                              {gig.Price && <span className="price-label">Fixed price</span>}
                            </>
                          )}
                        </span>
                        <button className="view-details-button" onClick={() => {OpenGig(gig.Id)}}>View Details</button>
                      </div>
                    </div>
                  </div>
                ));
              })()
            }
          </div>
        </main>
      </div>
      <Footer/>
    </div>
  );
};

export default ClientDashboard; 