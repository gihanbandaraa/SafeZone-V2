// Debug script to test request creation validation
const axios = require('axios');

const API_BASE_URL = 'http://192.168.1.168:5000/api';

async function testRequestCreation() {
  try {
    console.log('Testing request creation validation...');
    
    // First login to get a token
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'victim@safezone.com',
      password: 'victim123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test with valid data
    console.log('\n1. Testing with valid data...');
    const validRequest = {
      type: 'medical',
      description: 'This is a test emergency request with enough characters for validation',
      location: '123 Test Street, Test City',
      urgency: 'medium',
      contactInfo: '1234567890'
    };
    
    console.log('Sending request with data:', validRequest);
    
    const response = await axios.post(`${API_BASE_URL}/requests`, validRequest, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Request created successfully:', response.data.id);
    
    // Test with invalid data
    console.log('\n2. Testing with invalid data...');
    const invalidRequest = {
      type: '',  // empty type
      description: 'short',  // too short
      location: '',  // empty location
      urgency: 'invalid',  // invalid urgency
    };
    
    try {
      await axios.post(`${API_BASE_URL}/requests`, invalidRequest, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.log('❌ Expected validation error:', error.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testRequestCreation();