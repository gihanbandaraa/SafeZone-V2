// User roles
export const USER_ROLES = {
  VICTIM: 'victim',
  VOLUNTEER: 'volunteer',
  ORGANIZATION: 'organization',
  ADMIN: 'admin',
};

// User status
export const USER_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
};

// Natural disaster request types
export const REQUEST_TYPES = {
  FLOOD: 'flood',
  EARTHQUAKE: 'earthquake',
  LANDSLIDE: 'landslide',
  TSUNAMI: 'tsunami',
  WILDFIRE: 'wildfire',
  CYCLONE: 'cyclone',
  DROUGHT: 'drought',
  OTHER: 'other',
};

// Emergency request priorities
export const REQUEST_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// Emergency request status
export const REQUEST_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Organization types for disaster response
export const ORGANIZATION_TYPES = {
  DISASTER_RELIEF: 'disaster_relief',
  GOVERNMENT_EMERGENCY: 'government_emergency',
  RED_CROSS: 'red_cross',
  RESCUE_SERVICES: 'rescue_services',
  RELIEF_NGO: 'relief_ngo',
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  USERS: {
    PROFILE: '/users/profile',
  },
  REQUESTS: {
    BASE: '/requests',
    STATUS: (id) => `/requests/${id}/status`,
    ASSIGN: (id) => `/requests/${id}/assign`,
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    REQUESTS: '/admin/requests',
  },
};