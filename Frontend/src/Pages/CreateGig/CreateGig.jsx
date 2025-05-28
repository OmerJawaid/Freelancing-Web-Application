import React, { useState, useEffect, useContext } from 'react';
import './CreateGig.css';
import Navbar from '../../Components/Navbar Client/Navbar';
import Footer from '../../Components/Footer/Footer';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/Authcontext.jsx';

// Basic preview component
const GigPreview = ({ gigData }) => {
  return (
    <div className="gig-preview">
      <div className="preview-header">
        <h3>Gig Preview</h3>
      </div>
      
      <div className="preview-content">
        <div className="preview-image">
          {gigData.image ? (
            <img 
              src={URL.createObjectURL(gigData.image)} 
              alt="Gig preview" 
            />
          ) : (
            <div className="no-image">No image provided</div>
          )}
        </div>
        
        <div className="preview-details">
          <h4>{gigData.title}</h4>
          <p className="preview-category">Category: {gigData.category}</p>
          <div className="preview-description">
            <h5>Description:</h5>
            <p>{gigData.description}</p>
          </div>
        </div>
        
        <div className="preview-packages">
          <h5>Packages:</h5>
          {gigData.packages.map((pkg, index) => (
            <div key={index} className="preview-package">
              <h6>{pkg.Package_Name} Package - ${pkg.Price}</h6>
              <p>Delivery in {pkg.Delivery_Time} days</p>
              <p>{pkg.Package_Details}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Package component
const PackageItem = ({ pkg, index, handlePackageInputChange, handleRemovePackage, expandedPackage, setExpandedPackage }) => {
  // Determine package type name for display
  const getPackageTypeName = (type) => {
    switch(Number(type)) {
      case 1: return "Basic";
      case 2: return "Standard";
      case 3: return "Premium";
      default: return "Package";
    }
  };
  
  const isExpanded = expandedPackage === index;
  
  return (
    <div className={`package-item ${isExpanded ? 'expanded' : ''}`}>
      <div className="package-header" onClick={() => setExpandedPackage(isExpanded ? null : index)}>
        <h4>{getPackageTypeName(pkg.Type)} Package</h4>
        <div className="package-controls">
          <button 
            type="button" 
            className="remove-package" 
            onClick={(e) => {
              e.stopPropagation();
              handleRemovePackage(index);
            }}
            title="Remove package"
          >
            &times;
          </button>
          <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
        </div>
      </div>
      
      {isExpanded && (
        <div className="package-details">
          <div className="package-field">
            <label>Package Name</label>
            <input
              type="text"
              name="Package_Name"
              value={pkg.Package_Name}
              onChange={(e) => handlePackageInputChange(index, e)}
              placeholder={`${getPackageTypeName(pkg.Type)} Package`}
              required
            />
          </div>
          
          <div className="package-field">
            <label>Price (USD)</label>
            <input
              type="number"
              name="Price"
              value={pkg.Price}
              onChange={(e) => handlePackageInputChange(index, e)}
              min="5"
              step="5"
              required
            />
          </div>
          
          <div className="package-field">
            <label>Delivery Time (days)</label>
            <input
              type="number"
              name="Delivery_Time"
              value={pkg.Delivery_Time}
              onChange={(e) => handlePackageInputChange(index, e)}
              min="1"
              max="90"
              required
            />
          </div>
          
          <div className="package-field">
            <label>Package Details</label>
            <textarea
              name="Package_Details"
              value={pkg.Package_Details}
              onChange={(e) => handlePackageInputChange(index, e)}
              placeholder="What's included in this package..."
              required
            />
          </div>
        </div>
      )}
    </div>
  );
};

const CreateGig = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    image: null,
    packages: [
      {
        Type: 1,
        Package_Name: 'Basic Package',
        Price: 50,
        Delivery_Time: 3,
        Package_Details: 'Basic service with essential deliverables'
      }
    ]
  });
  
  const [showReview, setShowReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedPackage, setExpandedPackage] = useState(0);
  
  useEffect(() => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to create a gig", {
        autoClose: 3000
      });
      navigate('/login');
    } else if (user.User_Type !== 'freelancer') {
      toast.error("Only freelancers can create gigs", {
        autoClose: 3000
      });
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handlePackageInputChange = (index, e) => {
    const { name, value } = e.target;
    const newPackages = [...formData.packages];
    newPackages[index] = {
      ...newPackages[index],
      [name]: value
    };
    
    setFormData({
      ...formData,
      packages: newPackages
    });
  };
  
  const handleAddPackage = () => {
    if (formData.packages.length < 3) {
      const newType = formData.packages.length + 1;
      const packageName = newType === 2 ? 'Standard Package' : 'Premium Package';
      
      const newPackages = [
        ...formData.packages,
        {
          Type: newType,
          Package_Name: packageName,
          Price: formData.packages[formData.packages.length - 1].Price + 50,
          Delivery_Time: formData.packages[formData.packages.length - 1].Delivery_Time,
          Package_Details: `${packageName} with additional features`
        }
      ];
      
      setFormData({
        ...formData,
        packages: newPackages
      });
      
      // Auto-expand the newly added package
      setExpandedPackage(formData.packages.length);
      
      toast.success(`${packageName} package added`, {
        autoClose: 3000
      });
    } else {
      toast.warning('You can add a maximum of 3 packages.', {
        autoClose: 3000
      });
    }
  };

  const handleRemovePackage = (index) => {
    if (formData.packages.length <= 1) {
      toast.error("You need at least one package for your gig", {
        autoClose: 3000
      });
      return;
    }
    
    const packageName = formData.packages[index].Package_Name;
    const newPackages = [...formData.packages];
    newPackages.splice(index, 1);
    
    // Reset expanded package if needed
    if (expandedPackage >= newPackages.length) {
      setExpandedPackage(newPackages.length > 0 ? newPackages.length - 1 : null);
    }
    
    setFormData({
      ...formData,
      packages: newPackages
    });
    
    toast.info(`${packageName} package removed`, {
      autoClose: 3000
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        toast.error("Image is too large. Please select an image under 5MB.", {
          autoClose: 3000
        });
        e.target.value = null;
        return;
      }
      
      if (!file.type.match('image.*')) {
        toast.error("Please select a valid image file.", {
          autoClose: 3000
        });
        e.target.value = null;
        return;
      }
      
      setFormData({
        ...formData,
        image: file
      });
    }
  };

  const validateForm = () => {
    // Check for individual field validations
    if (!formData.title || formData.title.trim().length < 5) {
      toast.error('Please enter a gig title (minimum 5 characters)', {
        autoClose: 3000
      });
      return false;
    }
    
    if (!formData.description || formData.description.trim().length < 30) {
      toast.error('Please add a detailed description for your gig (minimum 30 characters)', {
        autoClose: 3000
      });
      return false;
    }
    
    if (!formData.category) {
      toast.error('Please select a category', {
        autoClose: 3000
      });
      return false;
    }
    
    if (formData.packages.length === 0) {
      toast.error('Please add at least one package', {
        autoClose: 3000
      });
      return false;
    }
    
    // Check all packages for required information
    let isValid = true;
    
    formData.packages.forEach((pkg, index) => {
      if (!pkg.Price || isNaN(Number(pkg.Price)) || Number(pkg.Price) <= 0) {
        toast.error(`Please enter a valid price for the ${pkg.Package_Name} package`, {
          autoClose: 3000
        });
        isValid = false;
      }
      
      if (!pkg.Delivery_Time || isNaN(Number(pkg.Delivery_Time)) || Number(pkg.Delivery_Time) <= 0) {
        toast.error(`Please enter a valid delivery time for the ${pkg.Package_Name} package`, {
          autoClose: 3000
        });
        isValid = false;
      }
      
      if (!pkg.Package_Details || pkg.Package_Details.trim().length < 10) {
        toast.error(`Please add details for the ${pkg.Package_Name} package (minimum 10 characters)`, {
          autoClose: 3000
        });
        isValid = false;
      }
    });
    
    return isValid;
  };

  const handleShowReview = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setShowReview(true);
      toast.success("Looking good! Review your gig before submitting", {
        autoClose: 3000
      });
    } else {
      // Focus on the first empty required field
      const firstEmptyField = document.querySelector('input:invalid, textarea:invalid, select:invalid');
      if (firstEmptyField) {
        firstEmptyField.focus();
      }
    }
  };

  const handleConfirmCreate = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    console.log("Starting gig submission process...");
    
    try {
      // Basic validation before sending
      if (!formData.title || !formData.description || !formData.category || formData.packages.length === 0) {
        toast.error('Please fill all required fields', {
          autoClose: 3000
        });
        setIsSubmitting(false);
        return;
      }

      console.log("Form validation passed, checking user authentication...");

      // First ensure the user is logged in and has a token
      const authToken = sessionStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      let parsedUser;
      let userToken = null; // Will be extracted from parsedUser if available
      
      try {
        parsedUser = storedUser ? JSON.parse(storedUser) : null;
        if (parsedUser && parsedUser.token) {
          userToken = parsedUser.token;
        }
      } catch (e) {
        console.error("Error parsing stored user:", e);
        parsedUser = null;
      }
      
      // Use the best available token
      const finalToken = authToken || userToken;
      
      // Log authentication state for debugging
      console.log("Authentication state:", {
        contextUser: user ? { id: user.id, type: user.User_Type } : 'Not available',
        parsedUser: parsedUser ? { id: parsedUser.id, type: parsedUser.User_Type } : 'Not available',
        hasToken: !!token,
        isAuthenticated
      });
      
      // Verify we have user data from context or storage
      if ((!isAuthenticated && !parsedUser) || (!user && !parsedUser)) {
        console.log("No user data available");
        toast.error("Please log in to create a gig", {
          autoClose: 3000
        });
        navigate('/login');
        setIsSubmitting(false);
        return;
      }

      // Format packages to match database schema exactly
      const formattedPackages = formData.packages.map(pkg => ({
        Type: Number(pkg.Type),
        Package_Name: pkg.Package_Name,
        Price: Number(pkg.Price),
        Delivery_Time: Number(pkg.Delivery_Time),
        Package_Details: pkg.Package_Details
      }));
      
      // Create FormData that matches the exact DB column names
      const data = new FormData();
      
      // Use exact column names from the gigs table 
      data.append('Title', formData.title.trim());
      data.append('Description', formData.description.trim());
      data.append('Category', formData.category);
      
      // Add packages as a string - make sure column name matches
      data.append('packages', JSON.stringify(formattedPackages));
      
      // Add image file if provided
      if (formData.image) {
        data.append('image', formData.image);
      }
      
      console.log("FormData being sent:");
      for (let [key, value] of data.entries()) {
        console.log(key, typeof value === 'object' ? 'File or Object data' : value);
      }
      
      // Use the finalToken we computed earlier
      if (!finalToken) {
        console.error('No authentication token available');
        toast.error('You must be logged in to create a gig. Please log in again.', { autoClose: 5000 });
        navigate('/login');
        return;
      }
      
      // Make a direct API call with explicit token authentication
      try {
        console.log('Preparing to send gig creation request...');
        
        // Set up headers for the API call
        const headers = {
          // Authorization header with token
          'Authorization': `Bearer ${finalToken}`
        };
        
        // Important debug info
        console.log('Request configuration:', { 
          url: 'https://freelancing-web-application-production.up.railway.app/gigs/createGig',
          hasToken: !!finalToken,
          tokenPrefix: finalToken ? finalToken.substring(0, 10) + '...' : 'N/A',
          method: 'POST',
          withCredentials: true
        });
        
        // Make the API call using axios with explicit headers
        const response = await axios.post(
          'https://freelancing-web-application-production.up.railway.app/gigs/createGig',
          data,
          {
            headers: headers,
            withCredentials: true
          }
        );
        
        // Log full response for debugging
        console.log('Gig creation successful response:', response.data);
        
        // Success handling
        toast.success('Gig created successfully!', {
          autoClose: 3000
        });
        
        // Navigate to dashboard
        navigate('/freelancer-dashboard');
        return; // Exit early after successful navigation
      } catch (authError) {
        console.error('Authentication error:', authError);
        toast.error('Authentication error. Please log in again.', { autoClose: 5000 });
        navigate('/login');
        setIsSubmitting(false);
        return;
      }
      
      // If we reach here, something went wrong but didn't throw an error
      toast.error('Unexpected response from server', { autoClose: 3000 });
      setIsSubmitting(false);
      
    } catch (error) {
      console.error('Error creating gig:', error);
      
      let errorMessage = 'Failed to create gig. ';
      
      if (error.response) {
        // Get specific error message from server if available
        errorMessage += error.response.data?.message || error.response.data?.error || error.message;
        console.error('Server error details:', error.response.data);
      } else if (error.request) {
        // Network error
        errorMessage += 'Network error - Please check your connection and try again.';
      } else {
        // Other errors
        errorMessage += error.message;
      }
      
      toast.error(errorMessage, {
        autoClose: 5000
      });
      
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-gig-container">
      <Navbar />
      <div className="create-gig-content">
        <h2>{showReview ? 'Review Your Gig' : 'Create New Gig'}</h2>

        {!showReview ? (
          <div className="form-section">
            <form onSubmit={handleShowReview}>
              <div className="form-main-fields">
                <div className="form-group">
                  <label htmlFor="title">Gig Title</label>
                  <input 
                  style={{color:'black'}}
                    type="text" 
                    id="title" 
                    name="title" 
                    value={formData.title} 
                    onChange={handleInputChange} 
                    placeholder="I will do something amazing..."
                    required 
                    minLength="5"
                    maxLength="100"
                    onInvalid={(e) => {
                      e.preventDefault();
                      toast.error("Please enter a valid gig title (5-100 characters)", {
                        autoClose: 3000
                      });
                    }}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select 
                    id="category" 
                    name="category" 
                    value={formData.category} 
                    onChange={handleInputChange} 
                    required
                    onInvalid={(e) => {
                      e.preventDefault();
                      toast.error("Please select a category", {
                        autoClose: 3000
                      });
                    }}
                  >
                    <option value="">Select a Category</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Design">Design</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="Writing">Writing</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="image">Gig Image (Optional)</label>
                  <input 
                    type="file" 
                    id="image" 
                    name="image" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                  <small className="form-text text-muted">
                    Maximum file size: 5MB. Supported formats: JPEG, JPG, PNG, GIF
                  </small>
                </div>
                
                <div className="form-group description-group">
                  <label htmlFor="description">Description</label>
                  <textarea 
                    id="description" 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    placeholder="Describe your service in detail..."
                    required 
                    minLength="30"
                    onInvalid={(e) => {
                      e.preventDefault();
                      toast.error("Please provide a detailed description (min 30 characters)", {
                        autoClose: 3000
                      });
                    }}
                  />
                </div>
              </div>

              <div className="packages-section">
                <h3>Packages ({formData.packages.length}/3)</h3>
                
                <div className="packages-container">
                  {formData.packages.map((pkg, index) => (
                    <PackageItem 
                      key={index}
                      pkg={pkg}
                      index={index}
                      handlePackageInputChange={handlePackageInputChange}
                      handleRemovePackage={handleRemovePackage}
                      expandedPackage={expandedPackage}
                      setExpandedPackage={setExpandedPackage}
                    />
                  ))}
                </div>
                
                {formData.packages.length < 3 && (
                  <button 
                    type="button" 
                    className="add-package-button" 
                    onClick={handleAddPackage}
                  >
                    + Add {formData.packages.length === 1 ? 'Standard' : 'Premium'} Package
                  </button>
                )}
                
                <div className="form-action">
                  <button type="submit" className="create-gig-button">Review Gig</button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="review-section">
            <GigPreview gigData={formData} />
            <div className="review-actions">
              <button 
                className="create-gig-button confirm-button" 
                onClick={handleConfirmCreate}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Confirm and Create'}
              </button>
              <button className="create-gig-button back-button" onClick={() => setShowReview(false)}>
                Back to Edit
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CreateGig;
