import React, { useEffect, useState, useContext } from 'react';
import './Dashboard.css';
import Navbar from '../../Components/Navbar Client/Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/Authcontext';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, checkAuthStatus } = useContext(AuthContext);
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchGigs = async () => {
      try {
        axios.defaults.withCredentials = true;
        await checkAuthStatus();
        const result = await axios.get("http://localhost:8081/freelancer-gigs");
        setGigs(result.data);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          await logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, [isAuthenticated, navigate, logout, checkAuthStatus]);

  const categories = ["All", "Web Development", "Design", "Mobile Development", "Writing", "Marketing"];
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Filter gigs based on category and search query
  const filteredGigs = gigs.filter((gig) => {
    const matchesCategory = selectedCategory === 'All' || gig.Category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      gig.Title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gig.Description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = 
      (priceRange.min === "" || gig.Price >= parseInt(priceRange.min)) &&
      (priceRange.max === "" || gig.Price <= parseInt(priceRange.max));
    
    return matchesCategory && matchesSearch && matchesPrice;
  });

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <Navbar onLogout={handleLogout} />
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
              <button 
                className="apply-filter-button"
                onClick={() => console.log("Apply price filter")}
              >
                Apply
              </button>
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
            />
            <button className="search-button">Search</button>
          </div>

          {/* Gigs Grid */}
          <div className="gigs-grid">

//             {filteredGigs.length > 0 ? (
//               filteredGigs.map((gig) => (
//                 <div key={gig.Id} className="gig-card">
//                   <div className="gig-image">
//                     <img src={gig.Image} alt={gig.Title} />
//                   </div>
//                   <div className="gig-details">
//                     <h3 className="gig-title">{gig.Title}</h3>
//                     <p className="gig-description">{gig.Description}</p>
//                     <div className="freelancer-info">
//                       <img
//                         src={gig.freelancerimage}
//                         alt={gig.Name}
//                         className="freelancer-image"
//                       />
//                       <div className="freelancer-details">
//                         <span className="freelancer-name">{gig.Name}</span>
//                         <div className="rating">
//                           <span className="stars">{'⭐'.repeat(Math.floor(gig.Rating))}</span>
//                           <span className="rating-number">({gig.Rating})</span>
//                         </div>
            {
              gigs
              .filter((gig) => selectedCategory==='All'||gig.Category === selectedCategory)
              .map((gig) => (
              <div key={gig.Id} className="gig-card">
                <div className="gig-image">
                  <img src={gig.Image} alt={gig.Title} />
                </div>
                <div className="gig-details">
                  <h3 className="gig-title">{gig.Title}</h3>
                  <p className="gig-description">{gig.Description}</p>
                  <div className="freelancer-info">
                    <img
                      src={gig.freelancerimage}
                      alt={gig.Name}
                      className="freelancer-image"
                    />
                    <div className="freelancer-details">
                      <span className="freelancer-name">{gig.Name}</span>
                      <div className="rating">
                        <span className="stars">{'⭐'.repeat(Math.floor(gig.Rating))}</span>
                        <span className="rating-number">({gig.Rating})</span>
                      </div>
                    </div>
                    <div className="gig-footer">
                      <span className="price">${gig.Price}</span>
                      <button className="view-details-button">View Details</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <p>No gigs found matching your criteria</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientDashboard;