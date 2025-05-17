import React, { useState } from 'react';
import './CreateGig.css';
import Navbar from '../../Components/Navbar Client/Navbar'; // Assuming the same navbar can be used or a new one created
import Footer from '../../Components/Footer/Footer'; // Assuming the same footer can be used
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Import toast

// Basic preview component (can be expanded later)
const GigPreview = ({ gigData }) => {
  return (
    <div className="gig-preview">
      <h3>Gig Preview</h3>
      {gigData.image && <img src={URL.createObjectURL(gigData.image)} alt="Gig Preview" className="preview-image" />}
      <h4>{gigData.title || '[Gig Title]'}</h4>
      <p>{gigData.description || '[Gig Description]'}</p>
      <h5>Category: {gigData.category || '[Category]'}</h5> {/* Display category */}
      <h5>Packages:</h5>
      <ul>
        {gigData.packages.length > 0 ? (
          gigData.packages.map((pkg, index) => (
            <li key={index}>
              <strong>{pkg.Package_Name || `Package ${index + 1}`}:</strong> ${pkg.Price || '[Price]'} - {pkg.Delivery_Time || '[Days]'} Days - {pkg.Package_Details || '[Details]'}
            </li>
          ))
        ) : (
          <li>No packages added yet.</li>
        )}
      </ul>
    </div>
  );
};

const CreateGig = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    image: null,
    packages: [] // Start with an empty packages array
  });

  const [showReview, setShowReview] = useState(false);
  const navigate = useNavigate();

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
      setFormData({
        ...formData,
        packages: [...formData.packages, { Type: packageType, Package_Name: packageName, Price: '', Delivery_Time: '', Package_Details: '' }]
      });
    } else {
      alert('You can add a maximum of 3 packages.');
    }
  };

  const handleRemovePackage = (index) => {
    const newPackages = [...formData.packages];
    newPackages.splice(index, 1);
    // Reassign package types and names after removal if necessary (optional, depends on backend)
    // newPackages.forEach((pkg, i) => { pkg.Type = i + 1; pkg.Package_Name = i === 0 ? 'Basic' : (i === 1 ? 'Standard' : 'Premium'); });
    setFormData({
      ...formData,
      packages: newPackages
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0]
    });
  };

  const handleShowReview = (e) => {
    e.preventDefault();
    // Basic validation
    if (!formData.title || !formData.description || !formData.category || !formData.image || formData.packages.length === 0 || formData.packages.some(pkg => !pkg.Price || !pkg.Delivery_Time || !pkg.Package_Details)) {
      toast.error('Please fill in all required fields for the gig and add at least one package with complete details.'); // Use toast.error
      return;
    }
    setShowReview(true);
  };

  const handleConfirmCreate = async () => {
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('packages', JSON.stringify(formData.packages));
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      const response = await axios.post('http://localhost:8081/gigs/createGig', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      if (response.status === 201) {
        console.log('Gig created successfully:', response.data);
        navigate('/freelancer');
      } else {
        console.error('Gig creation failed:', response.data.message);
        toast.error(`Gig creation failed: ${response.data.message}`); // Use toast.error
      }
    } catch (error) {
      console.error('Error creating gig:', error);
      toast.error('An error occurred during gig creation.'); // Use toast.error
    }
  };

  return (
    <div className="create-gig-container">
      <Navbar />
      <div className="create-gig-content">
        <h2>{showReview ? 'Review Your Gig' : 'Create New Gig'}</h2>

        {!showReview ? (
          // Gig Creation Form
          <div className="form-section">
            <form onSubmit={handleShowReview}> {/* Submit button now shows review */}
               <div className="form-main-fields"> {/* Container for left side fields */}
                  <div className="form-group">
                    <label htmlFor="title">Gig Title</label>
                    <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} required />
                  </div>
                   <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select id="category" name="category" value={formData.category} onChange={handleInputChange} required>
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
                    <input type="file" id="image" name="image" accept="image/*" onChange={handleFileChange} required />
                  </div>
               </div>

              {/* Packages Section */}
              <div className="packages-section">
                  <h3>Packages ({formData.packages.length}/3)</h3>
                  {formData.packages.map((pkg, index) => (
                    <div key={index} className="package-group">
                       <div className="package-header">
                          <h4>{pkg.Package_Name || `Package ${index + 1}`}</h4>
                          {formData.packages.length > 0 && (
                            <button type="button" className="remove-package-button" onClick={() => handleRemovePackage(index)}>
                              Remove
                            </button>
                          )}
                       </div>
                      <div className="form-group">
                        <label htmlFor={`price-${index}`}>Price ($)</label>
                        <input type="number" id={`price-${index}`} name="Price" value={pkg.Price} onChange={(e) => handlePackageInputChange(index, e)} required />
                      </div>
                      <div className="form-group">
                        <label htmlFor={`delivery-${index}`}>Delivery Time (Days)</label>
                        <input type="number" id={`delivery-${index}`} name="Delivery_Time" value={pkg.Delivery_Time} onChange={(e) => handlePackageInputChange(index, e)} required />
                      </div>
                      <div className="form-group">
                        <label htmlFor={`details-${index}`}>Details</label>
                        <textarea id={`details-${index}`} name="Package_Details" value={pkg.Package_Details} onChange={(e) => handlePackageInputChange(index, e)} required />
                      </div>
                    </div>
                  ))}
                  {formData.packages.length < 3 && (
                    <button type="button" className="add-package-button" onClick={handleAddPackage}>+ Add Package</button>
                  )}
              </div>

              <button type="submit" className="create-gig-button">Review Gig</button>
            </form>
          </div>
        ) : (
          // Gig Review Section
          <div className="review-section">
             <GigPreview gigData={formData} />
             <div className="review-actions">
                <button className="create-gig-button confirm-button" onClick={handleConfirmCreate}>Confirm and Create</button>
                <button className="create-gig-button back-button" onClick={() => setShowReview(false)}>Back to Edit</button>
             </div>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
};

export default CreateGig; 