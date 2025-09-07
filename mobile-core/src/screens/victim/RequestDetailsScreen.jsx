import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import ContactVolunteerModal from '../../components/ContactVolunteerModal';
import apiService from '../../services/apiService';

const STATUS_COLORS = {
  pending: '#f39c12',
  assigned: '#3498db',
  in_progress: '#9b59b6',
  completed: '#27ae60',
  cancelled: '#95a5a6',
};

const STATUS_ICONS = {
  pending: 'clock-outline',
  assigned: 'account-check',
  in_progress: 'progress-clock',
  completed: 'check-circle',
  cancelled: 'close-circle',
};

const URGENCY_COLORS = {
  low: '#27ae60',
  medium: '#f39c12',
  high: '#e67e22',
  critical: '#e74c3c',
};

export default function RequestDetailsScreen({ route, navigation }) {
  const { requestId } = route.params;
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchRequestDetails();
  }, [requestId]);

  const fetchRequestDetails = async () => {
    try {
      const response = await apiService.get(`/requests/${requestId}`);
      
      if (response.success) {
        setRequest(response.data);
      } else {
        Alert.alert('Error', 'Failed to load request details');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Fetch request details error:', error);
      Alert.alert('Error', 'Failed to load request details');
      navigation.goBack();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequestDetails();
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const response = await apiService.patch(`/requests/${requestId}/status`, {
        status: newStatus,
        completedBy: 'victim',
      });

      if (response.success) {
        setRequest(prev => ({ ...prev, status: newStatus }));
        Alert.alert('Success', `Request marked as ${newStatus}`);
      } else {
        Alert.alert('Error', response.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Status update error:', error);
      Alert.alert('Error', 'Failed to update request status');
    }
  };

  const handleCompleteRequest = () => {
    Alert.alert(
      'Complete Request',
      'Are you sure you want to mark this request as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => handleStatusUpdate('completed'),
        },
      ]
    );
  };

  const handleCancelRequest = () => {
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => handleStatusUpdate('cancelled'),
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      // Use a simpler, more compatible date formatting
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      
      // For React Native compatibility, use a manual format instead of toLocaleDateString
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${month} ${day}, ${year} at ${hours}:${minutes}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  const getStatusDisplay = (status) => {
    const statusText = status.replace('_', ' ').toUpperCase();
    return statusText;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading request details...</Text>
      </View>
    );
  }

  if (!request) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={48} color="#e74c3c" />
        <Text style={styles.errorText}>Request not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Status Header */}
        <View style={styles.statusHeader}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.statusGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.statusContent}>
              <MaterialCommunityIcons
                name={STATUS_ICONS[request.status]}
                size={24}
                color="white"
              />
              <Text style={styles.statusText}>
                {getStatusDisplay(request.status)}
              </Text>
            </View>
            <View style={[styles.urgencyBadge, { backgroundColor: URGENCY_COLORS[request.urgency] }]}>
              <Text style={styles.urgencyText}>{request.urgency.toUpperCase()}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Request Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Emergency Details</Text>
          
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="alert" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>
                {request.type.charAt(0).toUpperCase() + request.type.slice(1)} Emergency
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="text" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.detailValue}>{request.description}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>
                {request.address || request.location}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="clock" size={20} color="#666" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Reported</Text>
              <Text style={styles.detailValue}>{formatDate(request.createdAt)}</Text>
            </View>
          </View>

          {request.assignedAt && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="account-check" size={20} color="#666" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Assigned</Text>
                <Text style={styles.detailValue}>{formatDate(request.assignedAt)}</Text>
              </View>
            </View>
          )}

          {request.completedAt && (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#666" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Completed</Text>
                <Text style={styles.detailValue}>{formatDate(request.completedAt)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Volunteer Information */}
        {request.assignedVolunteer && (
          <View style={styles.volunteerCard}>
            <Text style={styles.cardTitle}>Assigned Volunteer</Text>
            <View style={styles.volunteerInfo}>
              <View style={styles.volunteerAvatar}>
                <Text style={styles.volunteerInitials}>
                  {request.assignedVolunteer.firstName?.charAt(0)}
                  {request.assignedVolunteer.lastName?.charAt(0)}
                </Text>
              </View>
              <View style={styles.volunteerDetails}>
                <Text style={styles.volunteerName}>
                  {request.assignedVolunteer.firstName} {request.assignedVolunteer.lastName}
                </Text>
                <Text style={styles.volunteerRole}>Emergency Response Volunteer</Text>
              </View>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => setContactModalVisible(true)}
              >
                <MaterialCommunityIcons name="message" size={20} color="#667eea" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Actions</Text>
          
          {request.status === 'in_progress' && (
            <TouchableOpacity style={styles.completeButton} onPress={handleCompleteRequest}>
              <LinearGradient
                colors={['#27ae60', '#2ecc71']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialCommunityIcons name="check-circle" size={20} color="white" />
                <Text style={styles.buttonText}>Mark as Completed</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {(request.status === 'pending' || request.status === 'assigned') && (
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelRequest}>
              <View style={styles.cancelButtonContent}>
                <MaterialCommunityIcons name="close-circle" size={20} color="#e74c3c" />
                <Text style={styles.cancelButtonText}>Cancel Request</Text>
              </View>
            </TouchableOpacity>
          )}

          {request.assignedVolunteer && (
            <TouchableOpacity
              style={styles.contactVolunteerButton}
              onPress={() => setContactModalVisible(true)}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialCommunityIcons name="account-voice" size={20} color="white" />
                <Text style={styles.buttonText}>Contact Volunteer</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Contact Volunteer Modal */}
      {request.assignedVolunteer && (
        <ContactVolunteerModal
          visible={contactModalVisible}
          onClose={() => setContactModalVisible(false)}
          volunteer={request.assignedVolunteer}
          requestId={request.id}
          onMessageSent={fetchRequestDetails}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8faff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8faff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8faff',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#e74c3c',
  },
  scrollView: {
    flex: 1,
  },
  statusHeader: {
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statusGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
  },
  urgencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  detailsCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  volunteerCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  volunteerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volunteerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  volunteerInitials: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  volunteerDetails: {
    flex: 1,
  },
  volunteerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  volunteerRole: {
    fontSize: 14,
    color: '#666',
  },
  contactButton: {
    padding: 8,
  },
  actionsCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  contactVolunteerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#e74c3c',
    borderRadius: 12,
    marginBottom: 12,
  },
  cancelButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
});
