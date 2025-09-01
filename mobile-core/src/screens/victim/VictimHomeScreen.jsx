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
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
      case 'pending': return '#FFA726';
      case 'assigned': return '#42A5F5';
      case 'in_progress': return '#26C6DA';
      case 'completed': return '#66BB6A';
      case 'cancelled': return '#EF5350';
      default: return '#9E9E9E';
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
        // Navigate to request details
        console.log('View request details:', item.id);
      }}
    >
      <View style={styles.requestHeader}>
        <View style={styles.requestInfo}>
          <Text style={styles.requestType}>{item.type}</Text>
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
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.requestDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      {item.location && (
        <View style={styles.locationContainer}>
          <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
      )}
      
      {item.assignedVolunteer && (
        <View style={styles.assignedContainer}>
          <MaterialCommunityIcons name="account" size={16} color="#2196F3" />
          <Text style={styles.assignedText}>
            Assigned to: {item.assignedVolunteer.firstName} {item.assignedVolunteer.lastName}
          </Text>
        </View>
      )}
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
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading your requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Emergency Requests</Text>
        <Text style={styles.subtitle}>
          Welcome, {user?.firstName}! Manage your emergency requests here.
        </Text>
      </View>

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
      >
        <MaterialCommunityIcons name="plus" size={24} color="white" />
      </TouchableOpacity>

      {/* Create Request Modal */}
      <CreateRequestScreen
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </View>
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
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 100,
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  requestInfo: {
    flex: 1,
  },
  requestType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  requestDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  requestDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  assignedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  assignedText: {
    fontSize: 14,
    color: '#2196F3',
    marginLeft: 5,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
});