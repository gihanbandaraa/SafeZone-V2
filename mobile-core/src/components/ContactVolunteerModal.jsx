import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Linking,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import apiService from '../services/apiService';

export default function ContactVolunteerModal({ 
  visible, 
  onClose, 
  volunteer, 
  requestId,
  onMessageSent 
}) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    try {
      setLoading(true);
      
      // Send message through API
      const response = await apiService.post('/requests/send-message', {
        requestId,
        volunteerId: volunteer.id,
        message: message.trim(),
        messageType: 'victim_to_volunteer',
      });

      if (response.success) {
        Alert.alert(
          'Message Sent!',
          'Your message has been sent to the volunteer. They will be notified.',
          [
            {
              text: 'OK',
              onPress: () => {
                setMessage('');
                onClose();
                if (onMessageSent) onMessageSent();
              },
            },
          ]
        );
      } else {
        throw new Error(response.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Send message error:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectCall = () => {
    if (!volunteer.phoneNumber) {
      Alert.alert('No Phone Number', 'This volunteer has not provided a phone number.');
      return;
    }

    Alert.alert(
      'Call Volunteer',
      `Do you want to call ${getVolunteerFullName(volunteer)} at ${volunteer.phoneNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            const phoneUrl = `tel:${volunteer.phoneNumber}`;
            Linking.canOpenURL(phoneUrl)
              .then((supported) => {
                if (supported) {
                  Linking.openURL(phoneUrl);
                } else {
                  Alert.alert('Error', 'Phone calling is not supported on this device');
                }
              })
              .catch(() => {
                Alert.alert('Error', 'Failed to initiate phone call');
              });
          },
        },
      ]
    );
  };

  const handleSendSMS = () => {
    if (!volunteer.phoneNumber) {
      Alert.alert('No Phone Number', 'This volunteer has not provided a phone number.');
      return;
    }

    const defaultMessage = `Hi ${getVolunteerFullName(volunteer)}, this is ${user?.firstName || user?.name || 'User'} regarding my emergency request. I need assistance.`;
    const smsUrl = `sms:${volunteer.phoneNumber}?body=${encodeURIComponent(defaultMessage)}`;
    
    Linking.canOpenURL(smsUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(smsUrl);
        } else {
          Alert.alert('Error', 'SMS is not supported on this device');
        }
      })
      .catch(() => {
        Alert.alert('Error', 'Failed to open SMS app');
      });
  };

  const getVolunteerInitials = (volunteer) => {
    const firstName = volunteer?.firstName || '';
    const lastName = volunteer?.lastName || '';
    
    if (!firstName && !lastName) {
      return 'UN'; // Default initials for Unknown
    }
    
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    
    return (firstInitial + lastInitial) || 'UN';
  };

  const getVolunteerFullName = (volunteer) => {
    const firstName = volunteer?.firstName || '';
    const lastName = volunteer?.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown Volunteer';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Contact Volunteer</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Volunteer Info */}
          <View style={styles.volunteerCard}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.volunteerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.volunteerAvatar}>
                <Text style={styles.volunteerInitials}>
                  {getVolunteerInitials(volunteer)}
                </Text>
              </View>
              <View style={styles.volunteerInfo}>
                <Text style={styles.volunteerName}>{getVolunteerFullName(volunteer)}</Text>
                <Text style={styles.volunteerRole}>Emergency Volunteer</Text>
                {volunteer.skills && volunteer.skills.length > 0 && (
                  <Text style={styles.volunteerSkills}>
                    Skills: {volunteer.skills.join(', ')}
                  </Text>
                )}
                {volunteer.phoneNumber && (
                  <View style={styles.contactInfo}>
                    <MaterialCommunityIcons name="phone" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.phoneNumber}>{volunteer.phoneNumber}</Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          </View>

          {/* Quick Contact Options */}
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Contact</Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity style={styles.quickActionButton} onPress={handleDirectCall}>
                <View style={[styles.actionIcon, { backgroundColor: '#27ae60' }]}>
                  <MaterialCommunityIcons name="phone" size={24} color="white" />
                </View>
                <Text style={styles.actionText}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickActionButton} onPress={handleSendSMS}>
                <View style={[styles.actionIcon, { backgroundColor: '#3498db' }]}>
                  <MaterialCommunityIcons name="message-text" size={24} color="white" />
                </View>
                <Text style={styles.actionText}>SMS</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickActionButton} 
                onPress={() => {/* Navigate to in-app chat if implemented */}}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#9b59b6' }]}>
                  <MaterialCommunityIcons name="chat" size={24} color="white" />
                </View>
                <Text style={styles.actionText}>Chat</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Send Message */}
          <View style={styles.messageSection}>
            <Text style={styles.sectionTitle}>Send Message</Text>
            <Text style={styles.sectionSubtitle}>
              Send a message to your assigned volunteer. They will receive a notification.
            </Text>
            
            <View style={styles.messageInputContainer}>
              <TextInput
                style={styles.messageInput}
                value={message}
                onChangeText={setMessage}
                placeholder="Type your message here..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!loading}
              />
            </View>

            <TouchableOpacity 
              style={[styles.sendButton, loading && styles.sendButtonDisabled]} 
              onPress={handleSendMessage}
              disabled={loading}
            >
              <LinearGradient
                colors={loading ? ['#bdc3c7', '#95a5a6'] : ['#667eea', '#764ba2']}
                style={styles.sendButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <MaterialCommunityIcons name="send" size={20} color="white" />
                )}
                <Text style={styles.sendButtonText}>
                  {loading ? 'Sending...' : 'Send Message'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Emergency Note */}
          <View style={styles.emergencyNote}>
            <MaterialCommunityIcons name="alert-circle" size={20} color="#e74c3c" />
            <Text style={styles.emergencyNoteText}>
              For immediate life-threatening emergencies, call emergency services (911) directly.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8faff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  volunteerCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  volunteerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  volunteerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  volunteerInitials: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  volunteerInfo: {
    flex: 1,
  },
  volunteerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  volunteerRole: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  volunteerSkills: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneNumber: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 6,
  },
  quickActions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  messageSection: {
    marginBottom: 24,
  },
  messageInputContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  messageInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
  },
  sendButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emergencyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff5f5',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  emergencyNoteText: {
    flex: 1,
    fontSize: 13,
    color: '#e74c3c',
    marginLeft: 12,
    lineHeight: 18,
  },
});