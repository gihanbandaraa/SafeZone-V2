// Test script to verify mobile app API connectivity
const axios = require('axios');

const API_BASE_URL = 'http://192.168.1.168:5000/api';

async function testAPI() {
  try {
    console.log('Testing SafeZone mobile API connectivity...');
    
    // Test 1: Register a victim user
    console.log('\n1. Testing user registration...');
    const timestamp = Date.now();
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      firstName: 'Test',
      lastName: 'Victim',
      email: `victim${timestamp}@test.com`,
      password: 'password123',
      phone: '1234567890',
      role: 'victim'
    });
    
    const token = registerResponse.data.token;
    console.log('✅ User registered successfully');
    
    // Test 2: Create emergency request
    console.log('\n2. Testing emergency request creation...');
    const requestResponse = await axios.post(`${API_BASE_URL}/requests`, {
      type: 'medical',
      description: 'Need urgent medical assistance for chest pain',
      location: '123 Main St, Emergency City',
      urgency: 'high',
      contactInfo: '1234567890'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Emergency request created successfully');
    console.log('Request ID:', requestResponse.data.id);
    
    // Test 3: Get user's requests
    console.log('\n3. Testing get my requests...');
    const myRequestsResponse = await axios.get(`${API_BASE_URL}/requests/my`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Retrieved user requests successfully');
    console.log('Number of requests:', myRequestsResponse.data.length);
    
    // Test 4: Register volunteer and get available requests
    console.log('\n4. Testing volunteer functionality...');
    const volunteerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      firstName: 'Test',
      lastName: 'Volunteer',
      email: `volunteer${timestamp}@test.com`,
      password: 'password123',
      phone: '0987654321',
      role: 'volunteer'
    });
    
    const volunteerToken = volunteerResponse.data.token;
    
    const availableRequestsResponse = await axios.get(`${API_BASE_URL}/requests/available`, {
      headers: { Authorization: `Bearer ${volunteerToken}` }
    });
    
    console.log('✅ Retrieved available requests for volunteer');
    console.log('Number of available requests:', availableRequestsResponse.data.length);
    
    // Test 5: Accept request
    if (availableRequestsResponse.data.length > 0) {
      const requestId = availableRequestsResponse.data[0].id;
      await axios.post(`${API_BASE_URL}/requests/${requestId}/accept`, {}, {
        headers: { Authorization: `Bearer ${volunteerToken}` }
      });
      console.log('✅ Request accepted by volunteer');
    }
    
    console.log('\n🎉 All mobile API tests passed! The app should work correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    console.error('Status:', error.response?.status);
  }
}

testAPI();