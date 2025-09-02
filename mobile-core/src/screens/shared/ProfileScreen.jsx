import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  StatusBar,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { selectCurrentUser, logout } from '../../store/slices/authSlice';

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            setShowLogoutModal(false);
          },
        },
      ]
    );
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'victim':
        return 'account-alert';
      case 'volunteer':
        return 'account-heart';
      case 'organization':
        return 'domain';
      case 'admin':
        return 'account-star';
      default:
        return 'account';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'victim':
        return '#FF5722';
      case 'volunteer':
        return '#26de81';
      case 'organization':
        return '#2196F3';
      case 'admin':
        return '#a55eea';
      default:
        return '#666';
    }
  };

  const menuItems = [
    {
      icon: 'account-edit',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      onPress: () => Alert.alert('Feature', 'Profile editing coming soon!'),
    },
    {
      icon: 'bell',
      title: 'Notifications',
      subtitle: 'Manage notification preferences',
      onPress: () => Alert.alert('Feature', 'Notification settings coming soon!'),
    },
    {
      icon: 'shield-check',
      title: 'Privacy & Security',
      subtitle: 'Manage your privacy settings',
      onPress: () => Alert.alert('Feature', 'Privacy settings coming soon!'),
    },
    {
      icon: 'help-circle',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: () => Alert.alert('Support', 'Contact us at support@safezone.com'),
    },
    {
      icon: 'information',
      title: 'About SafeZone',
      subtitle: 'Learn more about our mission',
      onPress: () => Alert.alert('About', 'SafeZone v2.0\nEmergency assistance platform'),
    },
  ];

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
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <MaterialCommunityIcons name="cog" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Modern User Info Card */}
        <View style={styles.userCard}>
          <LinearGradient
            colors={['#FFFFFF', '#F8FAFF']}
            style={styles.userCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.avatarSection}>
              <View style={[styles.avatarContainer, { backgroundColor: `${getRoleColor(user?.role)}15` }]}>
                <MaterialCommunityIcons
                  name={getRoleIcon(user?.role)}
                  size={60}
                  color={getRoleColor(user?.role)}
                />
              </View>
              
              <Text style={styles.userName}>
                {user?.firstName} {user?.lastName}
              </Text>
              
              <LinearGradient
                colors={[getRoleColor(user?.role), `${getRoleColor(user?.role)}CC`]}
                style={styles.roleBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialCommunityIcons
                  name={getRoleIcon(user?.role)}
                  size={16}
                  color="white"
                />
                <Text style={styles.roleText}>
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.userDetails}>
              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <MaterialCommunityIcons name="email" size={20} color="#667eea" />
                </View>
                <Text style={styles.detailText}>{user?.email}</Text>
              </View>
              
              {user?.phone && (
                <View style={styles.detailItem}>
                  <View style={styles.detailIconContainer}>
                    <MaterialCommunityIcons name="phone" size={20} color="#667eea" />
                  </View>
                  <Text style={styles.detailText}>{user?.phone}</Text>
                </View>
              )}
              
              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <MaterialCommunityIcons name="calendar" size={20} color="#667eea" />
                </View>
                <Text style={styles.detailText}>
                  Joined {new Date(user?.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Modern Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.lastMenuItem
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F8FAFF']}
                style={styles.menuItemGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconContainer}>
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={24}
                      color="#667eea"
                    />
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#c8d6e5" />
              </LinearGradient>
            </TouchableOpacity>
          ))}
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

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>SafeZone v2.0.0</Text>
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
  settingsButton: {
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
  userCard: {
    margin: 20,
    marginTop: -15,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  userCardGradient: {
    padding: 25,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  roleText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  userDetails: {
    width: '100%',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  detailText: {
    fontSize: 16,
    color: '#34495e',
    fontWeight: '500',
    flex: 1,
  },
  menuContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  menuItem: {
    marginBottom: 15,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  lastMenuItem: {
    marginBottom: 0,
  },
  menuItemGradient: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 3,
  },
  menuSubtitle: {
    fontSize: 14,
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
  versionContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#a4b0be',
    fontWeight: '500',
  },
});