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
import DirectionsModal from '../../components/DirectionsModal';

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
  
  // New state for assigned requests and tabs
  const [activeTab, setActiveTab] = useState('available');
  const [assignedRequests, setAssignedRequests] = useState([]);
  const [directionsVisible, setDirectionsVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    loadAvailableRequests();
    loadAssignedRequests();
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

  const loadAssignedRequests = async () => {
    try {
      const data = await ApiService.getAssignedRequests();
      setAssignedRequests(data);
    } catch (error) {
      console.error('Load assigned requests error:', error);
      Alert.alert('Error', 'Failed to load assigned requests');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'available') {
      await loadAvailableRequests();
    } else {
      await loadAssignedRequests();
    }
    setRefreshing(false);
  };

  const handleNavigateToLocation = (request) => {
    setSelectedRequest(request);
    setDirectionsVisible(true);
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      await ApiService.updateRequestStatus(requestId, newStatus);
      Alert.alert('Success', `Request status updated to ${newStatus}`);
      loadAssignedRequests(); // Refresh assigned requests
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update status');
    }
  };

  const handleStartWork = (requestId) => {
    Alert.alert(
      'Start Work',
      'Are you ready to start working on this emergency?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => handleUpdateStatus(requestId, 'in_progress'),
        },
      ]
    );
  };

  const handleCompleteWork = (requestId) => {
    Alert.alert(
      'Complete Work',
      'Have you completed assistance for this emergency?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => handleUpdateStatus(requestId, 'completed'),
        },
      ]
    );
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
              loadAssignedRequests(); // Also refresh assigned list
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to accept request');
            }
          },
        },
      ]
    );
  };

  const renderAvailableRequestItem = ({ item }) => (
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
            <Text style={styles.detailText}>{item.address || item.location}</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#747d8c" />
            <Text style={styles.detailText}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {item.user && (
          <View style={styles.userInfo}>
            <MaterialCommunityIcons name="account" size={16} color="#667eea" />
            <Text style={styles.userName}>
              Requested by: {item.user.firstName} {item.user.lastName}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptRequest(item.id)}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <MaterialCommunityIcons name="check" size={16} color="white" />
            <Text style={styles.buttonText}>Accept Request</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderAssignedRequestItem = ({ item }) => (
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
            <Text style={styles.detailText}>{item.address || item.location}</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#747d8c" />
            <Text style={styles.detailText}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {item.user && (
          <View style={styles.userInfo}>
            <MaterialCommunityIcons name="account" size={16} color="#667eea" />
            <Text style={styles.userName}>
              Victim: {item.user.firstName} {item.user.lastName}
            </Text>
          </View>
        )}

        <View style={styles.assignedActions}>
          <TouchableOpacity
            style={styles.navigateButton}
            onPress={() => handleNavigateToLocation(item)}
          >
            <MaterialCommunityIcons name="navigation" size={16} color="#667eea" />
            <Text style={styles.navigateButtonText}>Navigate</Text>
          </TouchableOpacity>

          {item.status === 'assigned' && (
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => handleStartWork(item.id)}
            >
              <MaterialCommunityIcons name="play" size={16} color="white" />
              <Text style={styles.startButtonText}>Start Work</Text>
            </TouchableOpacity>
          )}

          {item.status === 'in_progress' && (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => handleCompleteWork(item.id)}
            >
              <MaterialCommunityIcons name="check-circle" size={16} color="white" />
              <Text style={styles.completeButtonText}>Complete</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
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
            <Text style={styles.statNumber}>{assignedRequests.length}</Text>
            <Text style={styles.statLabel}>Assigned</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.activeTab]}
          onPress={() => setActiveTab('available')}
        >
          <MaterialCommunityIcons 
            name="heart-plus" 
            size={20} 
            color={activeTab === 'available' ? '#667eea' : '#747d8c'} 
          />
          <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
            Available ({availableRequests.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'assigned' && styles.activeTab]}
          onPress={() => setActiveTab('assigned')}
        >
          <MaterialCommunityIcons 
            name="account-check" 
            size={20} 
            color={activeTab === 'assigned' ? '#667eea' : '#747d8c'} 
          />
          <Text style={[styles.tabText, activeTab === 'assigned' && styles.activeTabText]}>
            My Tasks ({assignedRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading && (activeTab === 'available' ? availableRequests.length === 0 : assignedRequests.length === 0) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>
            Loading {activeTab === 'available' ? 'available' : 'assigned'} requests...
          </Text>
        </View>
      ) : (
        <FlatList
          data={activeTab === 'available' ? availableRequests : assignedRequests}
          renderItem={activeTab === 'available' ? renderAvailableRequestItem : renderAssignedRequestItem}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={
            (activeTab === 'available' ? availableRequests.length === 0 : assignedRequests.length === 0) 
              ? styles.emptyContainer 
              : styles.listContainer
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons 
                name={activeTab === 'available' ? "heart-plus" : "clipboard-check"} 
                size={80} 
                color="#ddd" 
              />
              <Text style={styles.emptyTitle}>
                No {activeTab === 'available' ? 'Available' : 'Assigned'} Requests
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'available' 
                  ? 'There are currently no emergency requests that need volunteers.'
                  : 'You have no assigned emergency requests at the moment.'
                }
              </Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={activeTab === 'available' ? loadAvailableRequests : loadAssignedRequests}
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
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* DirectionsModal */}
      <DirectionsModal
        visible={directionsVisible}
        onClose={() => setDirectionsVisible(false)}
        destinationCoords={{
          latitude: selectedRequest?.coordinates?.latitude || 0,
          longitude: selectedRequest?.coordinates?.longitude || 0,
        }}
        destinationAddress={selectedRequest?.address || selectedRequest?.location || 'Emergency Location'}
      />
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8faff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 25,
    marginHorizontal: 5,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeTab: {
    backgroundColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#747d8c',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#ffffff',
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
  buttonGradient: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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
  assignedActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  navigateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: '#f8faff',
    borderWidth: 2,
    borderColor: '#667eea',
    marginRight: 8,
  },
  navigateButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  startButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: '#26de81',
    marginLeft: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: '#667eea',
    marginLeft: 8,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
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