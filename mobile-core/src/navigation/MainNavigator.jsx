import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/slices/authSlice';

// Screens
import VictimHomeScreen from '../screens/victim/VictimHomeScreen';
import VolunteerHomeScreen from '../screens/volunteer/VolunteerHomeScreen';
import OrganizationHomeScreen from '../screens/organization/OrganizationHomeScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  const user = useSelector(selectCurrentUser);

  const getHomeScreen = () => {
    switch (user?.role) {
      case 'victim':
        return {
          component: VictimHomeScreen,
          icon: 'home-alert',
          label: 'Emergency'
        };
      case 'volunteer':
        return {
          component: VolunteerHomeScreen,
          icon: 'account-heart',
          label: 'Assignments'
        };
      case 'organization':
        return {
          component: OrganizationHomeScreen,
          icon: 'domain',
          label: 'Requests'
        };
      default:
        return {
          component: VictimHomeScreen,
          icon: 'home',
          label: 'Home'
        };
    }
  };

  const homeConfig = getHomeScreen();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = homeConfig.icon;
          } else if (route.name === 'Profile') {
            iconName = 'account-circle';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={homeConfig.component}
        options={{ tabBarLabel: homeConfig.label }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}