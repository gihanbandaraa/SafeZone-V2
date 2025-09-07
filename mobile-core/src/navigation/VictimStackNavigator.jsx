import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import VictimHomeScreen from '../screens/victim/VictimHomeScreen';
import RequestDetailsScreen from '../screens/victim/RequestDetailsScreen';

const Stack = createStackNavigator();

export default function VictimStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#667eea',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="VictimHome" 
        component={VictimHomeScreen}
        options={{ 
          title: 'Emergency Requests',
          headerShown: false // Keep the original design
        }}
      />
      <Stack.Screen 
        name="RequestDetails" 
        component={RequestDetailsScreen}
        options={{ 
          title: 'Request Details',
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}