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
  Dimensions,
  StatusBar,
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

const { width, height } = Dimensions.get('window');

const STATUS_COLORS = {
  pending: '#ff9f43',
  assigned: '#3742fa',
  in_progress: '#a55eea',
  completed: '#26de81',
  cancelled: '#fc5c65',
};

const STATUS_ICONS = {
  pending: 'clock-outline',
  assigned: 'account-check',
  in_progress: 'progress-clock',
  completed: 'check-circle',
  cancelled: 'close-circle',
};

const URGENCY_COLORS = {
  low: '#26de81',
  medium: '#fed330',
  high: '#fd79a8',
  critical: '#e55039',
};

const TYPE_ICONS = {
  'flood': 'waves',
  'earthquake': 'vibrate',
  'landslide': 'landslide',
  'tsunami': 'waves-arrow-right',
  'wildfire': 'fire',
  'cyclone': 'weather-hurricane',
  'drought': 'weather-sunny-off',
  'other': 'alert',
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
            <View style={styles.typeTextContainer}>
              <Text style={styles.requestType}>
                {item.type?.replace('_', ' ')}
              </Text>
              <Text style={styles.requestId}>ID: #{item.id}</Text>
            </View>
          </View>
          
          <View style={styles.badges}>
            <View style={[styles.urgencyBadge, { backgroundColor: URGENCY_COLORS[item.urgency] }]}>
              <Text style={styles.badgeText}>{item.urgency?.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.requestDescription} numberOfLines={3}>
          {item.description}
        </Text>

        <View style={styles.requestDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
              <Text style={styles.detailText} numberOfLines={1}>{item.location}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
              <Text style={styles.detailText}>
                {new Date(item.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          </View>
        </View>

        {item.User && (
          <View style={styles.userInfo}>
            <MaterialCommunityIcons name="account-circle" size={16} color="#4A90E2" />
            <Text style={styles.userName}>
              {item.User.firstName} {item.User.lastName}
            </Text>
          </View>
        )}

        {item.assignedVolunteer && (
          <View style={styles.volunteerInfo}>
            <MaterialCommunityIcons name="account-heart" size={16} color="#26de81" />
            <Text style={styles.volunteerName}>
              Assigned: {item.assignedVolunteer.firstName} {item.assignedVolunteer.lastName}
            </Text>
          </View>
        )}

        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] }]}>
            <MaterialCommunityIcons
              name={STATUS_ICONS[item.status]}
              size={14}
              color="white"
            />
            <Text style={styles.statusText}>{item.status?.replace('_', ' ').toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          {item.status === 'pending' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.assignButton]}
              onPress={() => handleUpdateStatus(item.id, 'assigned')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="account-check" size={16} color="white" />
              <Text style={styles.actionButtonText}>Assign</Text>
            </TouchableOpacity>
          )}
          {item.status === 'assigned' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.progressButton]}
              onPress={() => handleUpdateStatus(item.id, 'in_progress')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="play" size={16} color="white" />
              <Text style={styles.actionButtonText}>Start</Text>
            </TouchableOpacity>
          )}
          {item.status === 'in_progress' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => handleUpdateStatus(item.id, 'completed')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="check" size={16} color="white" />
              <Text style={styles.actionButtonText}>Complete</Text>
            </TouchableOpacity>
          )}
          {(item.status === 'pending' || item.status === 'assigned') && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleUpdateStatus(item.id, 'cancelled')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="close" size={16} color="white" />
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <MaterialCommunityIcons name="clipboard-list-outline" size={80} color="#E0E0E0" />
      </View>
      <Text style={styles.emptyTitle}>No Requests Found</Text>
      <Text style={styles.emptySubtitle}>
        {statusFilter === 'all' 
          ? 'There are currently no emergency requests in the system.'
          : `No requests found with "${statusFilter.replace('_', ' ')}" status.`
        }
      </Text>
      <TouchableOpacity 
        style={styles.refreshButton} 
        onPress={loadAllRequests}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#ff6b6b', '#ee5a6f']}
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

  const filteredRequests = getFilteredRequests();

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
            <View style={styles.headerTop}>
              <View style={styles.headerText}>
                <Text style={styles.title}>Emergency Control</Text>
                <Text style={styles.subtitle}>
                  {user?.organizationName || `${user?.firstName} ${user?.lastName}`}
                </Text>
              </View>
              <TouchableOpacity style={styles.notificationButton}>
                <MaterialCommunityIcons name="bell-outline" size={24} color="white" />
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationText}>{getStatusCount('pending')}</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Stats Row */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <MaterialCommunityIcons name="clock-outline" size={24} color="#ff9f43" />
                </View>
                <Text style={styles.statNumber}>{getStatusCount('pending')}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <MaterialCommunityIcons name="progress-clock" size={24} color="#a55eea" />
                </View>
                <Text style={styles.statNumber}>{getStatusCount('in_progress')}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <MaterialCommunityIcons name="check-circle" size={24} color="#26de81" />
                </View>
                <Text style={styles.statNumber}>{getStatusCount('completed')}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.contentContainer}>
          {/* Filter */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowStatusModal(true)}
              activeOpacity={0.8}
            >
              <View style={styles.filterContent}>
                <MaterialCommunityIcons name="filter-variant" size={20} color="#4A90E2" />
                <Text style={styles.filterText}>
                  {statusOptions.find(opt => opt.value === statusFilter)?.label}
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {loading && allRequests.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4A90E2" />
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
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#667eea']} />
              }
              ListEmptyComponent={renderEmptyState}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Status Filter Modal */}
        <Modal
          visible={showStatusModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowStatusModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filter Requests</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowStatusModal(false)}
                >
                  <MaterialCommunityIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              {statusOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    statusFilter === option.value && styles.selectedOption
                  ]}
                  onPress={() => {
                    setStatusFilter(option.value);
                    setShowStatusModal(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.optionText,
                    statusFilter === option.value && styles.selectedOptionText
                  ]}>
                    {option.label}
                  </Text>
                  {statusFilter === option.value && (
                    <MaterialCommunityIcons name="check-circle" size={20} color="#4A90E2" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingTop: height * 0.05,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '300',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF5722',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  filterContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
  },
  requestCard: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardGradient: {
    borderRadius: 16,
    padding: 20,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
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
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  typeTextContainer: {
    flex: 1,
  },
  requestType: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  requestId: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  badges: {
    alignItems: 'flex-end',
  },
  urgencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  requestDescription: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 16,
  },
  requestDetails: {
    marginBottom: 16,
  },
  detailRow: {
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 14,
    color: '#4A90E2',
    marginLeft: 8,
    fontWeight: '500',
  },
  volunteerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  volunteerName: {
    fontSize: 14,
    color: '#26de81',
    marginLeft: 8,
    fontWeight: '600',
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  assignButton: {
    backgroundColor: '#4A90E2',
  },
  progressButton: {
    backgroundColor: '#a55eea',
  },
  completeButton: {
    backgroundColor: '#26de81',
  },
  cancelButton: {
    backgroundColor: '#fc5c65',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  refreshButton: {
    borderRadius: 12,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  refreshButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: 32,
    maxHeight: height * 0.6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  modalCloseButton: {
    padding: 4,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  selectedOption: {
    backgroundColor: '#F0F7FF',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
});