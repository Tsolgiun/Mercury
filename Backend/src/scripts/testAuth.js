// Test script for authentication
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test registration
async function testRegistration() {
  try {
    console.log('Testing registration...');
    
    const userData = {
      name: 'Test User',
      email: 'testuser@example.com',
      username: 'testuser',
      password: 'password123'
    };
    
    console.log('Sending registration request with data:', {
      ...userData,
      password: '******' // Don't log actual password
    });
    
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    
    console.log('Registration successful!');
    console.log('Response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Registration failed!');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    
    throw error;
  }
}

// Test login
async function testLogin() {
  try {
    console.log('Testing login...');
    
    const loginData = {
      email: 'testuser@example.com',
      password: 'password123'
    };
    
    console.log('Sending login request with data:', {
      ...loginData,
      password: '******' // Don't log actual password
    });
    
    const response = await axios.post(`${API_URL}/auth/login`, loginData);
    
    console.log('Login successful!');
    console.log('Response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Login failed!');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    
    throw error;
  }
}

// Run tests
async function runTests() {
  try {
    // Test registration
    await testRegistration();
    
    // Test login
    await testLogin();
    
    console.log('All tests passed!');
  } catch (error) {
    console.error('Tests failed!');
  }
}

// Run the tests
runTests();
