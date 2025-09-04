// API Configuration - Single source of truth for all API settings
// Change this IP address when switching between different environments

// Development Configuration
const DEV_CONFIG = {
  // Change this IP to match your backend server
  HOST: '192.168.1.168', // Your friend's laptop IP
  PORT: '5000',
  PROTOCOL: 'http'
};

// Production Configuration (for future use)
const PROD_CONFIG = {
  HOST: 'your-production-domain.com',
  PORT: '443',
  PROTOCOL: 'https'
};

// Environment detection
const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';

// Select configuration
const CONFIG = isDevelopment ? DEV_CONFIG : PROD_CONFIG;

// Build API base URL
export const API_BASE_URL = `${CONFIG.PROTOCOL}://${CONFIG.HOST}:${CONFIG.PORT}/api`;

// Export individual parts for debugging
export const API_HOST = CONFIG.HOST;
export const API_PORT = CONFIG.PORT;
export const API_PROTOCOL = CONFIG.PROTOCOL;

// Debug logging
console.log(`🌐 [API Config] Using: ${API_BASE_URL}`);
console.log(`🏠 [API Config] Host: ${API_HOST}:${API_PORT}`);

export default {
  API_BASE_URL,
  API_HOST,
  API_PORT,
  API_PROTOCOL
};