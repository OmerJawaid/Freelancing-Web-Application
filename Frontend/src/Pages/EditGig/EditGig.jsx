import React, { useState, useEffect, useContext } from 'react';
import '../CreateGig/CreateGig.css';
import Navbar from '../../Components/Navbar Client/Navbar';
import Footer from '../../Components/Footer/Footer';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/Authcontext';

// Basic preview component
const GigPreview = ({ gigData }) => {
  if (!gigData) {
    return <div className="gig-preview">No gig data available</div>;
  }

  // Safe access to image
  const imageUrl = gigData.image instanceof File 
    ? URL.createObjectURL(gigData.image) 
    : gigData.image;

  return (
    <div className="gig-preview">
      <h3>Gig Preview</h3>
      
      {imageUrl ? (
        <img src={imageUrl} alt="Gig Preview" className="preview-image" />
      ) : (
        <div className="preview-image-placeholder">No image available</div>
      )}
      
      <h4>{gigData.title || 'Add a title for your gig'}</h4>
      
      <p>{gigData.description || 'Add a description to tell buyers what you offer'}</p>
      
      <h5>Category: {gigData.category || 'Select a category'}</h5>
      
      <h5>Packages:</h5>
      <ul>
        {gigData.packages && gigData.packages.length > 0 ? (
          gigData.packages.map((pkg, index) => (
            <li key={index}>
              <strong>{pkg.Package_Name || `Package ${index + 1}`}:</strong> 
              ${pkg.Price || '0'} - 
              {pkg.Delivery_Time || '0'} Days - 
              {pkg.Package_Details || 'No details provided'}
            </li>
          ))
        ) : (
          <li>No packages added yet.</li>
        )}
      </ul>
      
      {gigData.packages && gigData.packages.length > 0 && (
        <div className="starting-price">
          <h5>Starting at: ${(() => {
            const basicPackage = gigData.packages.find(pkg => Number(pkg.Type) === 1);
            return basicPackage ? basicPackage.Price : 'N/A';
          })()}</h5>
        </div>
      )}
    </div>
  );
};

const PackageItem = ({ pkg, index, handlePackageInputChange, handleRemovePackage, expandedPackage, setExpandedPackage }) => {
  const isExpanded = expandedPackage === index;
  
  return (
    <div className={`package-group ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div 
        className="package-header" 
        onClick={() => setExpandedPackage(isExpanded ? null : index)}
      >
        <h4>{pkg.Package_Name || `Package ${index + 1}`}</h4>
        <div className="package-controls">
          <button 
            type="button" 
            className="remove-package-button" 
            onClick={(e) => {
              e.stopPropagation();
              handleRemovePackage(index);
            }}
          >
            Remove
          </button>
          <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
      </div>
      
      <div className={`package-content ${isExpanded ? 'visible' : 'hidden'}`}>
        <div className="form-group">
          <label htmlFor={`price-${index}`}>Price ($)</label>
          <input 
            type="number" 
            id={`price-${index}`} 
            name="Price" 
            value={pkg.Price} 
            onChange={(e) => handlePackageInputChange(index, e)} 
            placeholder="Enter price"
            required 
            min="1"
            onInvalid={(e) => {
              e.preventDefault();
              toast.error("Price must be a positive number", {
                autoClose: 3000
              });
            }}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor={`delivery-${index}`}>Delivery Time (Days)</label>
          <input 
            type="number" 
            id={`delivery-${index}`} 
            name="Delivery_Time" 
            value={pkg.Delivery_Time} 
            onChange={(e) => handlePackageInputChange(index, e)} 
            placeholder="Number of days"
            required 
            min="1"
            onInvalid={(e) => {
              e.preventDefault();
              toast.error("Delivery time must be at least 1 day", {
                autoClose: 3000
              });
            }}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor={`details-${index}`}>Details</label>
          <textarea 
            id={`details-${index}`} 
            name="Package_Details" 
            value={pkg.Package_Details} 
            onChange={(e) => handlePackageInputChange(index, e)} 
            placeholder="What's included in this package?"
            required 
            minLength="10"
            onInvalid={(e) => {
              e.preventDefault();
              toast.error("Please provide more details about this package", {
                autoClose: 3000
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};

const EditGig = () => {
  const { gigId } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    image: null,
    packages: []
  });
  
  const [originalGigData, setOriginalGigData] = useState(null);
  const [expandedPackage, setExpandedPackage] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Get authentication data from context
  const { user, isAuthenticated } = useContext(AuthContext);

  // Check if user is authenticated and is a freelancer
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to edit a gig", {
        autoClose: 3000
      });
      navigate('/login');
      return;
    }

    if (!user || user.User_Type !== 'freelancer') {
      toast.error("Only freelancers can edit gigs", {
        autoClose: 3000
      });
      navigate('/');
      return;
    }

    console.log("User authenticated from context:", user);
  }, [isAuthenticated, user, navigate]);

  // Fetch existing gig data
  useEffect(() => {
    const fetchGigData = async () => {
      if (!gigId) {
        toast.error("No gig ID provided", {
          autoClose: 3000
        });
        navigate('/freelancer');
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch gig details
        const gigResponse = await axios.get(
          `https://freelancing-web-application-production.up.railway.app/gigs/retrieveGigByGigId`,
          { 
            params: { Gig_Id: gigId },
            withCredentials: true 
          }
        );
        
        if (!gigResponse.data) {
          toast.error("Gig not found", {
            autoClose: 3000
          });
          navigate('/freelancer');
          return;
        }

        // Verify the gig belongs to the logged-in freelancer
        if (gigResponse.data.Freelancer_Id !== user.id) {
          toast.error("You don't have permission to edit this gig", {
            autoClose: 3000
          });
          navigate('/freelancer');
          return;
        }

        // Fetch packages for the gig
        const packagesResponse = await axios.get(
          `https://freelancing-web-application-production.up.railway.app/packages/retrieve`,
          { 
            params: { Gig_Id: gigId },
            withCredentials: true 
          }
        );

        // Store original data for comparison
        setOriginalGigData(gigResponse.data);

        // Update form data
        setFormData({
          title: gigResponse.data.Title,
          description: gigResponse.data.Description,
          category: gigResponse.data.Category,
          image: gigResponse.data.Image, // Store image URL here
          // Initialize packages with data from the response
          packages: packagesResponse.data || []
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching gig data:", error);
        toast.error("Failed to load gig data", {
          autoClose: 3000
        });
        navigate('/freelancer');
      }
    };

    if (isAuthenticated && user && user.id) {
      fetchGigData();
    }
  }, [gigId, isAuthenticated, user, navigate]);

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
    newPackages[index][name] = value;
    setFormData({
      ...formData,
      packages: newPackages
    });
  };

  const handleAddPackage = () => {
    if (formData.packages.length < 3) {
      const packageType = formData.packages.length + 1;
      const packageName = packageType === 1 ? 'Basic' : (packageType === 2 ? 'Standard' : 'Premium');
      
      // Create package with fields matching database columns exactly
      setFormData({
        ...formData,
        packages: [...formData.packages, { 
          Type: packageType, 
          Package_Name: packageName,
          Price: '', 
          Delivery_Time: '', 
          Package_Details: '' 
        }]
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
      toast.success("Looking good! Review your changes before submitting", {
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

  const handleUpdateGig = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    console.log("Starting gig update process...");
    
    try {
      // Basic validation before sending
      if (!formData.title || !formData.description || !formData.category || !formData.packages.length === 0) {
        toast.error('Please fill all required fields', {
          autoClose: 3000
        });
        setIsSubmitting(false);
        return;
      }

      console.log("Form validation passed, checking user authentication...");

      // Verify we have user data from context
      if (!isAuthenticated || !user || !user.id) {
        console.log("User data missing or incomplete:", user);
        toast.error("Please log in to update a gig", {
          autoClose: 3000
        });
        navigate('/login');
        setIsSubmitting(false);
        return;
      }

      // Format packages to match database schema exactly
      const formattedPackages = formData.packages.map(pkg => ({
        // These must match the database column names exactly
        ID: pkg.ID || null, // Keep existing ID if it exists
        Gig_Id: gigId,
        Type: Number(pkg.Type),
        Package_Name: pkg.Package_Name,
        Price: Number(pkg.Price),
        Delivery_Time: Number(pkg.Delivery_Time),
        Package_Details: pkg.Package_Details
      }));
      
      // Create FormData that matches the exact DB column names
      const data = new FormData();
      
      // Use exact column names from the gigs table 
      data.append('Id', gigId);  // Add gig ID for update
      data.append('Title', formData.title.trim());
      data.append('Description', formData.description.trim());
      data.append('Category', formData.category);
      
      // Explicitly include the Freelancer_Id from context
      data.append('Freelancer_Id', user.id);
      console.log("Including Freelancer_Id:", user.id);
      
      // Add State with existing value or default to 1
      data.append('State', originalGigData.State || 1);
      
      // Add packages as a string - make sure column name matches
      data.append('packages', JSON.stringify(formattedPackages));
      
      // Add image file only if it's changed
      if (formData.image instanceof File) {
        data.append('image', formData.image);
      }
      
      console.log("FormData being sent for update:");
      for (let [key, value] of data.entries()) {
        console.log(key, typeof value === 'object' ? 'File or Object data' : value);
      }
      
      // Since there's no specific update endpoint, attempt to create a PUT route manually
      try {
        // First, check if we have a update endpoint
        const response = await axios.put(`https://freelancing-web-application-production.up.railway.app/gigs/updateGig/${gigId}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true
        });
        
        if (response.status === 200) {
          toast.success('Gig updated successfully!', {
            autoClose: 3000
          });
          navigate('/freelancer');
        } else {
          toast.error(`Update failed: ${response.data?.message || 'Unknown error'}`, {
            autoClose: 3000
          });
        }
      } catch (error) {
        console.error('API Error:', error);
        
        // If we get a 404 (endpoint doesn't exist), try a different approach
        if (error.response && error.response.status === 404) {
          toast.error("The update endpoint is not available. Please contact the administrator.", {
            autoClose: 3000
          });
        } else if (error.response) {
          // Get specific error message from server if available
          const errorMsg = error.response.data?.message || 'Server error';
          toast.error(errorMsg, {
            autoClose: 3000
          });
        } else {
          toast.error('Network error - Please try again', {
            autoClose: 3000
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong', {
        autoClose: 3000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-gig-container">
      <Navbar />
      <div className="create-gig-content">
        <h2>{showReview ? 'Review Your Changes' : 'Edit Gig'}</h2>

        {isLoading ? (
          <div className="loading-container">
            <p>Loading gig data...</p>
          </div>
        ) : (
          !showReview ? (
            <div className="form-section">
              <form onSubmit={handleShowReview}>
                <div className="form-main-fields">
                  <div className="form-group">
                    <label htmlFor="title">Gig Title</label>
                    <input 
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
                    <label htmlFor="image">Gig Image</label>
                    {formData.image && !(formData.image instanceof File) && (
                      <div className="current-image">
                        <img 
                          src={formData.image.startsWith('http') ? formData.image : `https://freelancing-web-application-production.up.railway.app${formData.image}`} 
                          alt="Current Gig" 
                          style={{ maxWidth: '100%', maxHeight: '200px', marginBottom: '10px' }} 
                        />
                        <p>Current Image</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      id="image" 
                      name="image" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      onInvalid={(e) => {
                        e.preventDefault();
                        toast.error("Please upload an image for your gig", {
                          autoClose: 3000
                        });
                      }}
                    />
                    <small>Upload a new image only if you want to change the current one</small>
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
                    <button type="submit" className="create-gig-button">Review Changes</button>
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
                  onClick={handleUpdateGig}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Confirm and Update'}
                </button>
                <button className="create-gig-button back-button" onClick={() => setShowReview(false)}>
                  Back to Edit
                </button>
              </div>
            </div>
          )
        )}
      </div>
      <Footer />
    </div>
  );
};

export default EditGig; 