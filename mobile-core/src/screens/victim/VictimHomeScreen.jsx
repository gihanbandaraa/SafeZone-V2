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
import { selectCurrentUser } from '../../store/slices/authSlice';
import {
  selectMyRequests,
  selectRequestsLoading,
  selectRequestsRefreshing,
  selectRequestsError,
  setMyRequests,
  setLoading,
  setRefreshing,
  setError,
} from '../../store/slices/requestsSlice';
import ApiService from '../../services/apiService';
import CreateRequestScreen from './CreateRequestScreen';

const { width } = Dimensions.get('window');

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

export default function VictimHomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const myRequests = useSelector(selectMyRequests);
  const loading = useSelector(selectRequestsLoading);
  const refreshing = useSelector(selectRequestsRefreshing);
  const error = useSelector(selectRequestsError);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadMyRequests();
  }, []);

  const loadMyRequests = async () => {
    try {
      dispatch(setLoading(true));
      const data = await ApiService.getMyRequests();
      dispatch(setMyRequests(data));
    } catch (error) {
      dispatch(setError(error.message));
      Alert.alert('Error', 'Failed to load your requests');
    }
  };

  const onRefresh = async () => {
    try {
      dispatch(setRefreshing(true));
      const data = await ApiService.getMyRequests();
      dispatch(setMyRequests(data));
    } catch (error) {
      dispatch(setError(error.message));
    }
  };

  const handleCreateSuccess = () => {
    // Refresh the list when a new request is created
    loadMyRequests();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ff9f43';
      case 'assigned': return '#3742fa';
      case 'in_progress': return '#a55eea';
      case 'completed': return '#26de81';
      case 'cancelled': return '#fc5c65';
      default: return '#747d8c';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'clock-outline';
      case 'assigned': return 'account-check';
      case 'in_progress': return 'progress-clock';
      case 'completed': return 'check-circle';
      case 'cancelled': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const renderRequestItem = ({ item }) => (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => {
        navigation.navigate('RequestDetails', { requestId: item.id });
      }}
      activeOpacity={0.95}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFF']}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.requestHeader}>
          <View style={styles.requestInfo}>
            <View style={styles.typeContainer}>
              <View style={styles.typeIconContainer}>
                <MaterialCommunityIcons
                  name={TYPE_ICONS[item.type] || 'alert'}
                  size={20}
                  color="#667eea"
                />
              </View>
              <Text style={styles.requestType}>{item.type}</Text>
            </View>
            <Text style={styles.requestDate}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <MaterialCommunityIcons
              name={getStatusIcon(item.status)}
              size={16}
              color="white"
            />
            <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
          </View>
        </View>
        
        <Text style={styles.requestDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        {item.location && (
          <View style={styles.locationContainer}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#747d8c" />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        )}
        
        {item.assignedVolunteer && (
          <View style={styles.assignedContainer}>
            <MaterialCommunityIcons name="account-heart" size={16} color="#26de81" />
            <Text style={styles.assignedText}>
              Assigned to: {item.assignedVolunteer.firstName} {item.assignedVolunteer.lastName}
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No Emergency Requests</Text>
      <Text style={styles.emptyStateText}>
        Tap the + button to create your first emergency request
      </Text>
    </View>
  );

  if (loading && myRequests.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading your requests...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <Text style={styles.title}>My Disaster Reports</Text>
            <Text style={styles.subtitle}>
              Welcome, {user?.firstName}! Track your natural disaster reports here.
            </Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{myRequests.length}</Text>
                <Text style={styles.statLabel}>Total Reports</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {myRequests.filter(r => r.status === 'pending').length}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {myRequests.filter(r => r.status === 'completed').length}
                </Text>
                <Text style={styles.statLabel}>Resolved</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

      <FlatList
        data={myRequests}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={EmptyState}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialCommunityIcons name="plus" size={28} color="white" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Create Request Modal */}
      <CreateRequestScreen
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerContent: {
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  requestCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 20,
    borderRadius: 16,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requestInfo: {
    flex: 1,
    marginRight: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  typeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  requestType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    textTransform: 'capitalize',
  },
  requestDate: {
    fontSize: 14,
    color: '#747d8c',
    marginLeft: 48,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 2,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  requestDescription: {
    fontSize: 16,
    color: '#34495E',
    lineHeight: 24,
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#747d8c',
    marginLeft: 8,
    flex: 1,
  },
  assignedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(38, 222, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  assignedText: {
    fontSize: 14,
    color: '#26de81',
    marginLeft: 8,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(224, 224, 224, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#34495E',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#747d8c',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#747d8c',
  },
});