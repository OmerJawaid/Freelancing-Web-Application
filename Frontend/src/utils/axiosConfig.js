import axios from 'axios';

// Set the base URL for all axios requests
// In development, this should point to your backend server
// In production, this can be a relative URL
const API_BASE_URL = import.meta.env.DEV 
  ? 'https://freelancing-web-application-production.up.railway.app' 
  : '';

// Create an axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout
});

export default axiosInstance;
