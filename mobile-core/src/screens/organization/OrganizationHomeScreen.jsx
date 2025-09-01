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
  Modal,
} from 'react-native';
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

const STATUS_COLORS = {
  pending: '#FF9800',
  assigned: '#2196F3',
  in_progress: '#26C6DA',
  completed: '#4CAF50',
  cancelled: '#F44336',
};

const STATUS_ICONS = {
  pending: 'clock-outline',
  assigned: 'account-check',
  in_progress: 'progress-clock',
  completed: 'check-circle',
  cancelled: 'close-circle',
};

const URGENCY_COLORS = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#F44336',
  critical: '#9C27B0',
};

const TYPE_ICONS = {
  medical: 'medical-bag',
  natural_disaster: 'weather-hurricane',
  fire: 'fire',
  security: 'shield-alert',
  infrastructure: 'home-alert',
  supplies: 'water',
  other: 'alert',
};

export default function OrganizationHomeScreen() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const allRequests = useSelector(selectAvailableRequests);
  const loading = useSelector(selectRequestsLoading);
  const error = useSelector(selectRequestsError);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showStatusModal, setShowStatusModal] = useState(false);

  const statusOptions = [
    { label: 'All Requests', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Assigned', value: 'assigned' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  useEffect(() => {
    loadAllRequests();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(setError(null));
    }
  }, [error]);

  const loadAllRequests = async () => {
    try {
      dispatch(setLoading(true));
      const data = await ApiService.getAllRequests();
      dispatch(setAvailableRequests(data));
    } catch (error) {
      dispatch(setError(error.message));
      Alert.alert('Error', 'Failed to load requests');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllRequests();
    setRefreshing(false);
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      await ApiService.updateRequestStatus(requestId, newStatus);
      Alert.alert('Success', 'Request status updated successfully!');
      loadAllRequests(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update request status');
    }
  };

  const getFilteredRequests = () => {
    if (statusFilter === 'all') {
      return allRequests;
    }
    return allRequests.filter(request => request.status === statusFilter);
  };

  const getStatusCount = (status) => {
    if (status === 'all') return allRequests.length;
    return allRequests.filter(request => request.status === status).length;
  };

  const renderRequestItem = ({ item }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.typeContainer}>
          <MaterialCommunityIcons
            name={TYPE_ICONS[item.type] || 'alert'}
            size={20}
            color="#2196F3"
          />
          <Text style={styles.requestType}>
            {item.type?.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
        <View style={styles.badges}>
          <View style={[styles.urgencyBadge, { backgroundColor: URGENCY_COLORS[item.urgency] }]}>
            <Text style={styles.badgeText}>{item.urgency?.toUpperCase()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] }]}>
            <MaterialCommunityIcons
              name={STATUS_ICONS[item.status]}
              size={12}
              color="white"
            />
            <Text style={styles.badgeText}>{item.status?.replace('_', ' ').toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.requestDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.requestDetails}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {item.User && (
        <View style={styles.userInfo}>
          <MaterialCommunityIcons name="account" size={16} color="#666" />
          <Text style={styles.userName}>
            Requested by: {item.User.firstName} {item.User.lastName}
          </Text>
        </View>
      )}

      {item.assignedVolunteer && (
        <View style={styles.volunteerInfo}>
          <MaterialCommunityIcons name="account-heart" size={16} color="#4CAF50" />
          <Text style={styles.volunteerName}>
            Volunteer: {item.assignedVolunteer.firstName} {item.assignedVolunteer.lastName}
          </Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
            onPress={() => handleUpdateStatus(item.id, 'assigned')}
          >
            <Text style={styles.actionButtonText}>Assign</Text>
          </TouchableOpacity>
        )}
        {item.status === 'assigned' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#26C6DA' }]}
            onPress={() => handleUpdateStatus(item.id, 'in_progress')}
          >
            <Text style={styles.actionButtonText}>Start Progress</Text>
          </TouchableOpacity>
        )}
        {item.status === 'in_progress' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => handleUpdateStatus(item.id, 'completed')}
          >
            <Text style={styles.actionButtonText}>Complete</Text>
          </TouchableOpacity>
        )}
        {(item.status === 'pending' || item.status === 'assigned') && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#F44336' }]}
            onPress={() => handleUpdateStatus(item.id, 'cancelled')}
          >
            <Text style={styles.actionButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="clipboard-list-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Requests Found</Text>
      <Text style={styles.emptySubtitle}>
        {statusFilter === 'all' 
          ? 'There are currently no emergency requests.'
          : `No requests with status "${statusFilter.replace('_', ' ')}".`
        }
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={loadAllRequests}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  const filteredRequests = getFilteredRequests();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Manage Requests</Text>
          <Text style={styles.subtitle}>
            Welcome, {user?.organizationName || user?.firstName}!
          </Text>
        </View>
        <MaterialCommunityIcons name="bell-outline" size={24} color="#666" />
      </View>

      {/* Stats Row */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{getStatusCount('pending')}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{getStatusCount('in_progress')}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{getStatusCount('completed')}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowStatusModal(true)}
        >
          <Text style={styles.filterText}>
            {statusOptions.find(opt => opt.value === statusFilter)?.label}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {loading && allRequests.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRequests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={
            filteredRequests.length === 0 ? styles.emptyContainer : styles.listContainer
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Status Filter Modal */}
      <Modal
        visible={showStatusModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter by Status</Text>
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.optionItem}
                onPress={() => {
                  setStatusFilter(option.value);
                  setShowStatusModal(false);
                }}
              >
                <Text style={styles.optionText}>{option.label}</Text>
                {statusFilter === option.value && (
                  <MaterialCommunityIcons name="check" size={20} color="#2196F3" />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowStatusModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  statsContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  filterText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  emptyContainer: {
    flex: 1,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requestType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  urgencyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  requestDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  requestDetails: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  volunteerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  volunteerName: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 6,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  modalCancelButton: {
    padding: 15,
    marginTop: 10,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});