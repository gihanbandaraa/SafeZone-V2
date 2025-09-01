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
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.typeContainer}>
          <MaterialCommunityIcons
            name={TYPE_ICONS[item.type] || 'alert'}
            size={24}
            color="#2196F3"
          />
          <Text style={styles.requestType}>
            {item.type?.replace('_', ' ').toUpperCase()}
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

      <TouchableOpacity
        style={styles.acceptButton}
        onPress={() => handleAcceptRequest(item.id)}
      >
        <MaterialCommunityIcons name="hand-heart" size={20} color="white" />
        <Text style={styles.acceptButtonText}>Accept Request</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="heart-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Available Requests</Text>
      <Text style={styles.emptySubtitle}>
        There are currently no emergency requests that need volunteers.
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={loadAvailableRequests}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Available Requests</Text>
          <Text style={styles.subtitle}>
            Welcome, {user?.firstName}! Help those in need.
          </Text>
        </View>
        <MaterialCommunityIcons name="bell-outline" size={24} color="#666" />
      </View>

      {loading && availableRequests.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
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
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
    marginBottom: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  userName: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
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
});