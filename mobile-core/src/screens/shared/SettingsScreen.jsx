import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIconContainer}>
          <MaterialCommunityIcons name={icon} size={24} color="#2196F3" />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || (onPress && <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />)}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

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
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={notificationsEnabled ? '#2196F3' : '#f4f3f4'}
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
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={soundEnabled ? '#2196F3' : '#f4f3f4'}
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
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={emergencyAlerts ? '#2196F3' : '#f4f3f4'}
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
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={locationEnabled ? '#2196F3' : '#f4f3f4'}
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

        {/* User Info */}
        <View style={styles.userInfoContainer}>
          <Text style={styles.userInfoText}>
            Signed in as {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.userInfoSubtext}>
            {user?.email} • {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
          </Text>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={24} color="#F44336" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 30,
    marginBottom: 10,
    marginHorizontal: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingItemNoBorder: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  userInfoContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userInfoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userInfoSubtext: {
    fontSize: 14,
    color: '#666',
  },
  logoutContainer: {
    margin: 20,
    marginTop: 0,
  },
  logoutButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F44336',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
    marginLeft: 8,
  },
});