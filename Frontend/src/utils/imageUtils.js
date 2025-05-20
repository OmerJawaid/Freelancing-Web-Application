/**
 * Utility functions for handling image paths in the application
 */

// Default images for fallbacks
export const DEFAULT_USER_IMAGE = "https://dummyimage.com/100/e9ecef/495057&text=User";
export const DEFAULT_GIG_IMAGE = "https://dummyimage.com/800x450/e9ecef/495057&text=Gig+Image";
export const DEFAULT_REVIEW_IMAGE = "https://dummyimage.com/50/e9ecef/495057&text=User";

// Backend server URL
const BACKEND_URL = 'http://localhost:8081';

/**
 * Converts a database image path to a valid frontend path
 * @param {string} imagePath - The image path stored in the database
 * @param {string} defaultImage - Default image to use if the path is invalid
 * @returns {string} A valid image URL
 */
export const getImageUrl = (imagePath, defaultImage = DEFAULT_USER_IMAGE) => {
  console.log('Getting URL for image path:', imagePath);
  
  // If path is null or empty, return default
  if (!imagePath) {
    console.log('No image path provided, using default');
    return defaultImage;
  }

  // If it's an absolute URL (starts with http:// or https://)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('Image path is already an absolute URL');
    return imagePath;
  }

  // If it's a backend public path
  if (imagePath.startsWith('/public/')) {
    const url = `${BACKEND_URL}${imagePath}`;
    console.log(`Converting backend public path to URL: ${url}`);
    return url;
  }

  // For legacy paths, check for specific formats
  if (imagePath.startsWith('/profileImages/')) {
    const url = `${BACKEND_URL}/public${imagePath}`;
    console.log(`Converting legacy profileImages path to URL: ${url}`);
    return url;
  }

  // For asset paths, just pass to backend
  if (imagePath.startsWith('/assets/')) {
    const url = `${BACKEND_URL}${imagePath}`;
    console.log(`Converting assets path to URL: ${url}`);
    return url;
  }

  // For any other path, prepend backend URL
  const url = `${BACKEND_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  console.log(`Default path handling: ${url}`);
  return url;
};

/**
 * A safe wrapper for image URLs that handles errors and provides fallbacks
 * @param {string} imageUrl - The image URL to check
 * @param {string} defaultImage - Default image to use if the URL is invalid
 * @returns {string} A valid image URL
 */
export const getSafeImageUrl = (imageUrl, defaultImage = DEFAULT_USER_IMAGE) => {
  try {
    return getImageUrl(imageUrl, defaultImage);
  } catch (error) {
    console.error('Error getting safe image URL:', error);
    return defaultImage;
  }
}; 