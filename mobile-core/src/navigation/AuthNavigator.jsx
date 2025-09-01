import React, { useState } from 'react';
import { View } from 'react-native';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';

export default function AuthNavigator() {
  const [currentScreen, setCurrentScreen] = useState('Welcome');

  const navigation = {
    navigate: (screenName) => setCurrentScreen(screenName)
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Welcome':
        return <WelcomeScreen navigation={navigation} />;
      case 'Login':
        return <LoginScreen navigation={navigation} />;
      case 'Register':
        return <RegisterScreen navigation={navigation} />;
      default:
        return <WelcomeScreen navigation={navigation} />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {renderScreen()}
    </View>
  );
}