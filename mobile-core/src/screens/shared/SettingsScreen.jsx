import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  StatusBar,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { selectCurrentUser, logout } from '../../store/slices/authSlice';

export default function SettingsScreen() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  
  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => dispatch(logout()),
        },
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, rightComponent, onPress, showBorder = true }) => (
    <TouchableOpacity
      style={[styles.settingItem, !showBorder && styles.settingItemNoBorder]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFF']}
        style={styles.settingItemGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.settingLeft}>
          <View style={styles.settingIconContainer}>
            <MaterialCommunityIcons name={icon} size={24} color="#667eea" />
          </View>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>{title}</Text>
            {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
          </View>
        </View>
        {rightComponent || (onPress && <MaterialCommunityIcons name="chevron-right" size={20} color="#c8d6e5" />)}
      </LinearGradient>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* Modern Header with Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>Settings</Text>
          <TouchableOpacity style={styles.searchButton}>
            <MaterialCommunityIcons name="magnify" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Notifications Section */}
        <SectionHeader title="Notifications" />
        <View style={styles.section}>
          <SettingItem
            icon="bell"
            title="Push Notifications"
            subtitle="Receive emergency alerts and updates"
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#e9ecef', true: '#667eea40' }}
                thumbColor={notificationsEnabled ? '#667eea' : '#adb5bd'}
              />
            }
          />
          <SettingItem
            icon="volume-high"
            title="Sound"
            subtitle="Play sound for notifications"
            rightComponent={
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: '#e9ecef', true: '#667eea40' }}
                thumbColor={soundEnabled ? '#667eea' : '#adb5bd'}
              />
            }
          />
          <SettingItem
            icon="alert"
            title="Emergency Alerts"
            subtitle="Critical emergency notifications"
            rightComponent={
              <Switch
                value={emergencyAlerts}
                onValueChange={setEmergencyAlerts}
                trackColor={{ false: '#e9ecef', true: '#26de8140' }}
                thumbColor={emergencyAlerts ? '#26de81' : '#adb5bd'}
              />
            }
            showBorder={false}
          />
        </View>

        {/* Privacy & Security Section */}
        <SectionHeader title="Privacy & Security" />
        <View style={styles.section}>
          <SettingItem
            icon="map-marker"
            title="Location Services"
            subtitle="Allow access to your location"
            rightComponent={
              <Switch
                value={locationEnabled}
                onValueChange={setLocationEnabled}
                trackColor={{ false: '#e9ecef', true: '#667eea40' }}
                thumbColor={locationEnabled ? '#667eea' : '#adb5bd'}
              />
            }
          />
          <SettingItem
            icon="shield-lock"
            title="Privacy Policy"
            subtitle="Read our privacy policy"
            onPress={() => Alert.alert('Privacy', 'Privacy policy coming soon!')}
          />
          <SettingItem
            icon="file-document"
            title="Terms of Service"
            subtitle="Read terms and conditions"
            onPress={() => Alert.alert('Terms', 'Terms of service coming soon!')}
            showBorder={false}
          />
        </View>

        {/* Account Section */}
        <SectionHeader title="Account" />
        <View style={styles.section}>
          <SettingItem
            icon="account-edit"
            title="Edit Profile"
            subtitle="Update your personal information"
            onPress={() => Alert.alert('Profile', 'Profile editing coming soon!')}
          />
          <SettingItem
            icon="lock-reset"
            title="Change Password"
            subtitle="Update your password"
            onPress={() => Alert.alert('Password', 'Password change coming soon!')}
          />
          <SettingItem
            icon="account-remove"
            title="Delete Account"
            subtitle="Permanently delete your account"
            onPress={() => Alert.alert(
              'Delete Account',
              'This action cannot be undone. Are you sure?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive' }
              ]
            )}
            showBorder={false}
          />
        </View>

        {/* Support Section */}
        <SectionHeader title="Support" />
        <View style={styles.section}>
          <SettingItem
            icon="help-circle"
            title="Help Center"
            subtitle="Get help and support"
            onPress={() => Alert.alert('Help', 'Help center coming soon!')}
          />
          <SettingItem
            icon="email"
            title="Contact Support"
            subtitle="Send us a message"
            onPress={() => Alert.alert('Contact', 'Email: support@safezone.com')}
          />
          <SettingItem
            icon="star"
            title="Rate App"
            subtitle="Rate SafeZone on the app store"
            onPress={() => Alert.alert('Rate', 'Thank you for using SafeZone!')}
          />
          <SettingItem
            icon="information"
            title="About"
            subtitle="App version and information"
            onPress={() => Alert.alert('About', 'SafeZone v2.0.0\nEmergency assistance platform')}
            showBorder={false}
          />
        </View>

        {/* Modern User Info */}
        <View style={styles.userInfoContainer}>
          <LinearGradient
            colors={['#FFFFFF', '#F8FAFF']}
            style={styles.userInfoGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.userInfoContent}>
              <View style={styles.userAvatarContainer}>
                <MaterialCommunityIcons name="account" size={32} color="#667eea" />
              </View>
              <View style={styles.userTextContainer}>
                <Text style={styles.userInfoText}>
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text style={styles.userInfoSubtext}>
                  {user?.email} • {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Modern Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#ff6b6b', '#ee5a52']}
              style={styles.logoutButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <MaterialCommunityIcons name="logout" size={24} color="white" />
              <Text style={styles.logoutText}>Logout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8faff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  searchButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2c3e50',
    marginTop: 25,
    marginBottom: 15,
    marginHorizontal: 25,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  settingItem: {
    marginBottom: 15,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  settingItemNoBorder: {
    marginBottom: 15,
  },
  settingItemGradient: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 3,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#747d8c',
    fontWeight: '500',
  },
  userInfoContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  userInfoGradient: {
    padding: 20,
  },
  userInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userTextContainer: {
    flex: 1,
  },
  userInfoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 5,
  },
  userInfoSubtext: {
    fontSize: 15,
    color: '#747d8c',
    fontWeight: '500',
  },
  logoutContainer: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  logoutButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoutButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  logoutText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
});