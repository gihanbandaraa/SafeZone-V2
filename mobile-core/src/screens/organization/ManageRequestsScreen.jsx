import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
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
  setAvailableRequests,
  setLoading,
} from '../../store/slices/requestsSlice';
import { selectCurrentUser } from '../../store/slices/authSlice';
import ApiService from '../../services/apiService';
import RequestsMapView from '../../components/RequestsMapView';

const { width, height } = Dimensions.get('window');

const URGENCY_COLORS = {
  low: '#26de81',
  medium: '#fed330',
  high: '#fd79a8',
  critical: '#e55039',
};

const STATUS_COLORS = {
  pending: '#ff9f43',
  assigned: '#3742fa',
  in_progress: '#a55eea',
  completed: '#26de81',
  cancelled: '#fc5c65',
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

export default function ManageRequestsScreen() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const allRequests = useSelector(selectAvailableRequests);
  const loading = useSelector(selectRequestsLoading);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  const sortOptions = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' },
    { label: 'High Priority', value: 'priority' },
    { label: 'Location (A-Z)', value: 'location' },
    { label: 'Status', value: 'status' },
  ];

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      dispatch(setLoading(true));
      const data = await ApiService.getAllRequests();
      dispatch(setAvailableRequests(data));
    } catch (error) {
      Alert.alert('Error', 'Failed to load requests');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const getFilteredAndSortedRequests = () => {
    let filtered = allRequests;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(request =>
        request.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.User?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.User?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'priority':
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return filtered.sort((a, b) => priorityOrder[b.urgency] - priorityOrder[a.urgency]);
      case 'location':
        return filtered.sort((a, b) => a.location?.localeCompare(b.location) || 0);
      case 'status':
        return filtered.sort((a, b) => a.status?.localeCompare(b.status) || 0);
      default:
        return filtered;
    }
  };

  const handleAssignVolunteer = async (requestId) => {
    try {
      await ApiService.updateRequestStatus(requestId, 'assigned');
      Alert.alert('Success', 'Request assigned successfully!');
      loadRequests();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to assign request');
    }
  };

  const handleRequestFromMap = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const renderRequestItem = ({ item }) => (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => {
        setSelectedRequest(item);
        setShowDetailModal(true);
      }}
      activeOpacity={0.95}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFF']}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.typeContainer}>
            <View style={styles.typeIconContainer}>
              <MaterialCommunityIcons
                name={TYPE_ICONS[item.type] || 'alert'}
                size={20}
                color="#4A90E2"
              />
            </View>
            <View style={styles.typeInfo}>
              <Text style={styles.requestType}>{item.type}</Text>
              <Text style={styles.requestId}>#{item.id}</Text>
            </View>
          </View>
          
          <View style={styles.badges}>
            <View style={[styles.urgencyBadge, { backgroundColor: URGENCY_COLORS[item.urgency] }]}>
              <Text style={styles.badgeText}>{item.urgency?.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.requestInfo}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
            <Text style={styles.infoText} numberOfLines={1}>{item.location}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
            <Text style={styles.infoText}>
              {new Date(item.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] }]}>
            <Text style={styles.statusText}>{item.status?.replace('_', ' ').toUpperCase()}</Text>
          </View>
          
          {item.status === 'pending' && (
            <TouchableOpacity
              style={styles.quickAssignButton}
              onPress={() => handleAssignVolunteer(item.id)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="account-plus" size={16} color="white" />
              <Text style={styles.quickAssignText}>Assign</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderDetailModal = () => (
    <Modal
      visible={showDetailModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowDetailModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.detailModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Request Details</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDetailModal(false)}
            >
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          {selectedRequest && (
            <View style={styles.modalContent}>
              <View style={styles.detailHeader}>
                <View style={styles.detailTypeContainer}>
                  <MaterialCommunityIcons
                    name={TYPE_ICONS[selectedRequest.type] || 'alert'}
                    size={32}
                    color="#4A90E2"
                  />
                  <View style={styles.detailTypeInfo}>
                    <Text style={styles.detailType}>{selectedRequest.type}</Text>
                    <Text style={styles.detailId}>Request #{selectedRequest.id}</Text>
                  </View>
                </View>
                
                <View style={styles.detailBadges}>
                  <View style={[styles.urgencyBadge, { backgroundColor: URGENCY_COLORS[selectedRequest.urgency] }]}>
                    <Text style={styles.badgeText}>{selectedRequest.urgency?.toUpperCase()}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[selectedRequest.status] }]}>
                    <Text style={styles.statusText}>{selectedRequest.status?.replace('_', ' ').toUpperCase()}</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.detailDescription}>{selectedRequest.description}</Text>

              <View style={styles.detailInfo}>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="map-marker" size={20} color="#4A90E2" />
                  <Text style={styles.detailLabel}>Location:</Text>
                  <Text style={styles.detailValue}>{selectedRequest.location}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color="#4A90E2" />
                  <Text style={styles.detailLabel}>Created:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedRequest.createdAt).toLocaleString()}
                  </Text>
                </View>
                
                {selectedRequest.User && (
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="account" size={20} color="#4A90E2" />
                    <Text style={styles.detailLabel}>Requested by:</Text>
                    <Text style={styles.detailValue}>
                      {selectedRequest.User.firstName} {selectedRequest.User.lastName}
                    </Text>
                  </View>
                )}
                
                {selectedRequest.contactInfo && (
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="phone" size={20} color="#4A90E2" />
                    <Text style={styles.detailLabel}>Contact:</Text>
                    <Text style={styles.detailValue}>{selectedRequest.contactInfo}</Text>
                  </View>
                )}
              </View>

              {selectedRequest.status === 'pending' && (
                <TouchableOpacity
                  style={styles.assignButton}
                  onPress={() => {
                    handleAssignVolunteer(selectedRequest.id);
                    setShowDetailModal(false);
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#ff6b6b', '#ee5a6f']}
                    style={styles.assignButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <MaterialCommunityIcons name="account-plus" size={20} color="white" />
                    <Text style={styles.assignButtonText}>Assign Volunteer</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  const filteredRequests = getFilteredAndSortedRequests();

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
            <Text style={styles.title}>Manage Requests</Text>
            <Text style={styles.subtitle}>Advanced request management</Text>
          </View>
        </LinearGradient>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search requests..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
          
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setShowSortModal(true)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="sort" size={20} color="#4A90E2" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.viewToggleButton, viewMode === 'map' && styles.viewToggleButtonActive]}
            onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons 
              name={viewMode === 'list' ? 'map' : 'view-list'} 
              size={20} 
              color={viewMode === 'map' ? 'white' : '#4A90E2'} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''} found
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Loading requests...</Text>
          </View>
        ) : viewMode === 'list' ? (
          <FlatList
            data={filteredRequests}
            renderItem={renderRequestItem}
            keyExtractor={(item) => item.id?.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="clipboard-search-outline" size={80} color="#E0E0E0" />
                <Text style={styles.emptyTitle}>No Requests Found</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery ? 'Try adjusting your search terms' : 'No requests available to manage'}
                </Text>
              </View>
            )}
          />
        ) : (
          <RequestsMapView
            requests={filteredRequests}
            onRequestSelect={handleRequestFromMap}
            userRole="organization"
            style={styles.mapContainer}
          />
        )}

        {/* Sort Modal */}
        <Modal
          visible={showSortModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSortModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.sortModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Sort By</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowSortModal(false)}
                >
                  <MaterialCommunityIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.sortOption,
                    sortBy === option.value && styles.selectedSortOption
                  ]}
                  onPress={() => {
                    setSortBy(option.value);
                    setShowSortModal(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.sortOptionText,
                    sortBy === option.value && styles.selectedSortOptionText
                  ]}>
                    {option.label}
                  </Text>
                  {sortBy === option.value && (
                    <MaterialCommunityIcons name="check-circle" size={20} color="#4A90E2" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>

        {renderDetailModal()}
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  sortButton: {
    width: 48,
    height: 48,
    backgroundColor: 'white',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewToggleButton: {
    width: 48,
    height: 48,
    backgroundColor: 'white',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewToggleButtonActive: {
    backgroundColor: '#4A90E2',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  cardHeader: {
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
  typeInfo: {
    flex: 1,
  },
  requestType: {
    fontSize: 16,
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
  description: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 16,
  },
  requestInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  quickAssignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  quickAssignText: {
    color: 'white',
    fontSize: 12,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sortModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    maxHeight: height * 0.5,
  },
  detailModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    maxHeight: height * 0.85,
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
  closeButton: {
    padding: 4,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  selectedSortOption: {
    backgroundColor: '#F0F7FF',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  selectedSortOptionText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  modalContent: {
    padding: 24,
  },
  detailHeader: {
    marginBottom: 24,
  },
  detailTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailTypeInfo: {
    flex: 1,
    marginLeft: 16,
  },
  detailType: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  detailId: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  detailDescription: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 24,
  },
  detailInfo: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginLeft: 12,
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginLeft: 8,
  },
  assignButton: {
    borderRadius: 12,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  assignButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  assignButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});