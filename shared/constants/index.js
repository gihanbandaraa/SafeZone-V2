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

// Emergency request types
export const REQUEST_TYPES = {
  FOOD: 'food',
  WATER: 'water',
  MEDICINE: 'medicine',
  SHELTER: 'shelter',
  RESCUE: 'rescue',
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

// Organization types
export const ORGANIZATION_TYPES = {
  NGO: 'ngo',
  GOVERNMENT: 'government',
  MEDICAL: 'medical',
  EMERGENCY_SERVICES: 'emergency_services',
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