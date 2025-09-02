import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  selectAvailableRequests,
  selectRequestsLoading,
  selectRequestsError,
  setAvailableRequests,
  setLoading,
  setError,
} from '../../store/slices/requestsSlice';
import { selectCurrentUser } from '../../store/slices/authSlice';
import ApiService from '../../services/apiService';

const URGENCY_COLORS = {
  low: '#26de81',
  medium: '#fed330',
  high: '#fd79a8',
  critical: '#e55039',
};

const TYPE_ICONS = {
  flood: 'waves',
  earthquake: 'vibrate',
  landslide: 'image-broken-variant',
  tsunami: 'waves',
  wildfire: 'fire',
  cyclone: 'weather-hurricane',
  drought: 'weather-sunny-alert',
  other: 'alert',
};

export default function VolunteerHomeScreen() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const availableRequests = useSelector(selectAvailableRequests);
  const loading = useSelector(selectRequestsLoading);
  const error = useSelector(selectRequestsError);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAvailableRequests();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(setError(null));
    }
  }, [error]);

  const loadAvailableRequests = async () => {
    try {
      dispatch(setLoading(true));
      const data = await ApiService.getAvailableRequests();
      dispatch(setAvailableRequests(data));
    } catch (error) {
      dispatch(setError(error.message));
      Alert.alert('Error', 'Failed to load available requests');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAvailableRequests();
    setRefreshing(false);
  };

  const handleAcceptRequest = async (requestId) => {
    Alert.alert(
      'Accept Request',
      'Are you sure you want to accept this emergency request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              await ApiService.acceptRequest(requestId);
              Alert.alert('Success', 'Request accepted successfully!');
              loadAvailableRequests(); // Refresh the list
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to accept request');
            }
          },
        },
      ]
    );
  };

  const renderRequestItem = ({ item }) => (
    <TouchableOpacity style={styles.requestCard} activeOpacity={0.95}>
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFF']}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.requestHeader}>
          <View style={styles.typeContainer}>
            <View style={styles.typeIconContainer}>
              <MaterialCommunityIcons
                name={TYPE_ICONS[item.type] || 'alert'}
                size={20}
                color="#667eea"
              />
            </View>
            <Text style={styles.requestType}>
              {item.type?.replace('_', ' ')}
            </Text>
          </View>
          <View style={[styles.urgencyBadge, { backgroundColor: URGENCY_COLORS[item.urgency] }]}>
            <Text style={styles.urgencyText}>{item.urgency?.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.requestDescription} numberOfLines={3}>
          {item.description}
        </Text>

        <View style={styles.requestDetails}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#747d8c" />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#747d8c" />
            <Text style={styles.detailText}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {item.User && (
          <View style={styles.userInfo}>
            <MaterialCommunityIcons name="account" size={16} color="#667eea" />
            <Text style={styles.userName}>
              Requested by: {item.User.firstName} {item.User.lastName}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptRequest(item.id)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#26de81', '#20bf6b']}
            style={styles.acceptButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <MaterialCommunityIcons name="hand-heart" size={20} color="white" />
            <Text style={styles.acceptButtonText}>Accept Request</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="heart-plus" size={80} color="#ddd" />
      <Text style={styles.emptyTitle}>No Available Requests</Text>
      <Text style={styles.emptySubtitle}>
        There are currently no emergency requests that need volunteers.
      </Text>
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={loadAvailableRequests}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.refreshButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <MaterialCommunityIcons name="refresh" size={20} color="white" />
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
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
          <View>
            <Text style={styles.welcomeText}>Volunteer Dashboard</Text>
            <Text style={styles.headerSubtitle}>
              Welcome, {user?.firstName}! Help those in need.
            </Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <MaterialCommunityIcons name="account" size={28} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Stats Container */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{availableRequests.length}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {availableRequests.filter(r => r.urgency === 'critical').length}
            </Text>
            <Text style={styles.statLabel}>Critical</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Accepted</Text>
          </View>
        </View>
      </LinearGradient>

      {loading && availableRequests.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading available requests...</Text>
        </View>
      ) : (
        <FlatList
          data={availableRequests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={
            availableRequests.length === 0 ? styles.emptyContainer : styles.listContainer
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    marginBottom: 25,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#747d8c',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e6ed',
    marginHorizontal: 15,
  },
  listContainer: {
    padding: 20,
    paddingTop: 25,
    paddingBottom: 30,
  },
  emptyContainer: {
    flex: 1,
    paddingTop: 50,
  },
  requestCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardGradient: {
    padding: 20,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  requestType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    textTransform: 'capitalize',
    flex: 1,
  },
  urgencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  urgencyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  requestDescription: {
    fontSize: 15,
    color: '#34495e',
    lineHeight: 22,
    marginBottom: 15,
  },
  requestDetails: {
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#747d8c',
    marginLeft: 8,
    fontWeight: '500',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  userName: {
    fontSize: 14,
    color: '#667eea',
    marginLeft: 8,
    fontWeight: '600',
  },
  acceptButton: {
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#26de81',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  acceptButtonGradient: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#747d8c',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  refreshButton: {
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  refreshButtonGradient: {
    paddingHorizontal: 25,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#747d8c',
    fontWeight: '500',
  },
});