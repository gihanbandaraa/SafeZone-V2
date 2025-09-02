import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark" size={80} color="white" />
            </View>
            <Text style={styles.title}>SafeZone</Text>
            <Text style={styles.subtitle}>Natural Disaster Response & Relief</Text>
          </View>
          
          <View style={styles.description}>
            <Text style={styles.descriptionText}>
              Connect with volunteers, organizations, and relief services during natural disasters.
            </Text>
            <Text style={styles.descriptionText}>
              Report floods, earthquakes, landslides and get immediate help.
            </Text>
          </View>
          
          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Sign In</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.8}
            >
              <Text style={styles.registerButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: height * 0.12,
    paddingBottom: 60,
  },
  header: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: 'white',
    marginBottom: 12,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    fontWeight: '300',
    opacity: 0.95,
    lineHeight: 26,
  },
  description: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  descriptionText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    opacity: 0.9,
    lineHeight: 24,
    fontWeight: '300',
  },
  buttons: {
    width: '100%',
    gap: 16,
  },
  loginButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonText: {
    color: '#667eea',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  registerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});