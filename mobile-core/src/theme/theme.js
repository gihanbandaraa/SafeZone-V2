import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#667eea',
    secondary: '#FFC107',
    tertiary: '#26de81',
    surface: '#FFFFFF',
    background: '#F5F5F5',
    error: '#fc5c65',
    warning: '#fed330',
    success: '#26de81',
    info: '#2196F3',
    
    // Natural disaster type colors
    disaster: {
      flood: '#3742fa',
      earthquake: '#8d5524',
      landslide: '#5D4037',
      tsunami: '#0abde3',
      wildfire: '#ff3838',
      cyclone: '#a55eea',
      drought: '#fed330',
      other: '#747d8c',
    },
    
    // Status colors
    status: {
      pending: '#ff9f43',
      assigned: '#3742fa',
      in_progress: '#a55eea',
      completed: '#26de81',
      cancelled: '#fc5c65',
    },
    
    // Priority colors
    priority: {
      low: '#26de81',
      medium: '#fed330',
      high: '#fd79a8',
      critical: '#e55039',
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