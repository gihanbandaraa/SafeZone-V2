import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.1.168:5000/api';

class ApiService {
  // Get auth token
  async getToken() {
    return await AsyncStorage.getItem('token');
  }

  // Common headers
  async getHeaders() {
    const token = await this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  // Handle API response
  async handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
      // Handle validation errors specifically
      if (data.errors && Array.isArray(data.errors)) {
        const errorMessages = data.errors.map(error => error.msg).join(', ');
        throw new Error(`Validation failed: ${errorMessages}`);
      }
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    return data;
  }

  // Auth endpoints
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return this.handleResponse(response);
  }

  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  // Emergency Request endpoints
  async createEmergencyRequest(requestData) {
    const response = await fetch(`${API_BASE_URL}/requests`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify(requestData),
    });
    return this.handleResponse(response);
  }

  async getMyRequests() {
    const response = await fetch(`${API_BASE_URL}/requests/my`, {
      headers: await this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getAvailableRequests() {
    const response = await fetch(`${API_BASE_URL}/requests/available`, {
      headers: await this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getAllRequests() {
    const response = await fetch(`${API_BASE_URL}/requests/all`, {
      headers: await this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async acceptRequest(requestId) {
    const response = await fetch(`${API_BASE_URL}/requests/${requestId}/accept`, {
      method: 'POST',
      headers: await this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateRequestStatus(requestId, status) {
    const response = await fetch(`${API_BASE_URL}/requests/${requestId}/status`, {
      method: 'PATCH',
      headers: await this.getHeaders(),
      body: JSON.stringify({ status }),
    });
    return this.handleResponse(response);
  }

  async getRequestDetails(requestId) {
    const response = await fetch(`${API_BASE_URL}/requests/${requestId}`, {
      headers: await this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // User endpoints
  async getUserProfile() {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: await this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateProfile(userData) {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: await this.getHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }
}

export default new ApiService();