import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2196F3',
    secondary: '#FFC107',
    tertiary: '#4CAF50',
    surface: '#FFFFFF',
    background: '#F5F5F5',
    error: '#F44336',
    warning: '#FF9800',
    success: '#4CAF50',
    info: '#2196F3',
    
    // Emergency type colors
    emergency: {
      food: '#FF9800',
      water: '#2196F3',
      medicine: '#E91E63',
      shelter: '#9C27B0',
      rescue: '#F44336',
      other: '#607D8B',
    },
    
    // Status colors
    status: {
      pending: '#FF9800',
      assigned: '#2196F3',
      in_progress: '#9C27B0',
      completed: '#4CAF50',
      cancelled: '#F44336',
    },
    
    // Priority colors
    priority: {
      low: '#4CAF50',
      medium: '#FF9800',
      high: '#FF5722',
      critical: '#F44336',
    },
  },
  
  // Custom spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  // Custom elevations
  elevation: {
    card: 2,
    modal: 8,
    drawer: 16,
  },
};