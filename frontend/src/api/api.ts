import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // Debug logs for the token
      console.log('Token being used:', token);
      console.log('Authorization header:', `Bearer ${token}`);
    }
    
    // Debug logs for all requests
    console.log('Request URL:', config.url);
    console.log('Request method:', config.method);
    console.log('Request headers:', config.headers);
    
    if (config.data) {
      console.log('Request data:', config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    return response;
  },
  (error) => {
    console.error('Response interceptor error:');
    
    if (error.response) {
      console.error('- Status:', error.response.status);
      console.error('- Data:', error.response.data);
      console.error('- Headers:', error.response.headers);
    } else if (error.request) {
      console.error('- No response received from server');
      console.error('- Request:', error.request);
    } else {
      console.error('- Message:', error.message);
    }
    
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // You could redirect to login page here
    }
    
    return Promise.reject(error);
  }
);

export default api;
