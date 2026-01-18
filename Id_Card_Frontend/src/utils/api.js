import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Extract data from the standardized response format
    if (response.data && response.data.success) {
      return response.data;
    }
    return response.data;
  },
  (error) => {
    // Handle errors consistently
    const message = 
      error.response?.data?.error || 
      error.response?.data?.message || 
      error.message || 
      'An unexpected error occurred';
    
    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

export default api;
