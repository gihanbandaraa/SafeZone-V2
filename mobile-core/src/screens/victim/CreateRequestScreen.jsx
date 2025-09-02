import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { addMyRequest, setError } from '../../store/slices/requestsSlice';
import ApiService from '../../services/apiService';

const EMERGENCY_TYPES = [
  { label: 'Flood', value: 'flood', icon: 'waves' },
  { label: 'Earthquake', value: 'earthquake', icon: 'vibrate' },
  { label: 'Landslide', value: 'landslide', icon: 'landslide' },
  { label: 'Tsunami', value: 'tsunami', icon: 'waves-arrow-right' },
  { label: 'Wildfire', value: 'wildfire', icon: 'fire' },
  { label: 'Cyclone/Hurricane', value: 'cyclone', icon: 'weather-hurricane' },
  { label: 'Drought', value: 'drought', icon: 'weather-sunny-off' },
  { label: 'Other Natural Disaster', value: 'other', icon: 'alert' },
];

const URGENCY_LEVELS = [
  { label: 'Low', value: 'low', color: '#26de81' },
  { label: 'Medium', value: 'medium', color: '#fed330' },
  { label: 'High', value: 'high', color: '#fd79a8' },
  { label: 'Critical', value: 'critical', color: '#e55039' },
];

export default function CreateRequestScreen({ visible, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    urgency: 'medium',
    description: '',
    location: '',
    contactInfo: '',
  });
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showUrgencyPicker, setShowUrgencyPicker] = useState(false);

  const handleSubmit = async () => {
    if (!formData.type || !formData.description || !formData.location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.description.trim().length < 10) {
      Alert.alert('Error', 'Description must be at least 10 characters long');
      return;
    }

    setLoading(true);
    try {
      const newRequest = await ApiService.createEmergencyRequest(formData);
      dispatch(addMyRequest(newRequest));
      Alert.alert('Success', 'Disaster report submitted successfully!', [
        { text: 'OK', onPress: () => {
          onSuccess && onSuccess();
          onClose();
        }}
      ]);
      setFormData({
        type: '',
        urgency: 'medium',
        description: '',
        location: '',
        contactInfo: '',
      });
    } catch (error) {
      console.error('Create request error:', error);
      dispatch(setError(error.message));
      
      // Show more detailed error information
      let errorMessage = 'Failed to create request';
      if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedType = () => {
    return EMERGENCY_TYPES.find(type => type.value === formData.type);
  };

  const getSelectedUrgency = () => {
    return URGENCY_LEVELS.find(urgency => urgency.value === formData.urgency);
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
          <Text style={styles.title}>Report Natural Disaster</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Emergency Type */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Disaster Type *</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowTypePicker(true)}
            >
              {getSelectedType() ? (
                <View style={styles.selectedOption}>
                  <MaterialCommunityIcons
                    name={getSelectedType().icon}
                    size={20}
                    color="#667eea"
                  />
                  <Text style={styles.selectedText}>{getSelectedType().label}</Text>
                </View>
              ) : (
                <Text style={styles.placeholderText}>Select disaster type</Text>
              )}
              <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Urgency Level */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Urgency Level</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowUrgencyPicker(true)}
            >
              <View style={styles.selectedOption}>
                <View style={[styles.urgencyDot, { backgroundColor: getSelectedUrgency().color }]} />
                <Text style={styles.selectedText}>{getSelectedUrgency().label}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={styles.textArea}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Describe the natural disaster situation and your immediate needs..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Location */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
              placeholder="Enter your current location or address"
            />
          </View>

          {/* Contact Info */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Additional Contact Info</Text>
            <TextInput
              style={styles.input}
              value={formData.contactInfo}
              onChangeText={(text) => setFormData(prev => ({ ...prev, contactInfo: text }))}
              placeholder="Alternative phone number, etc."
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <MaterialCommunityIcons name="send" size={20} color="white" />
                <Text style={styles.submitButtonText}>Submit Request</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Type Picker Modal */}
        <Modal
          visible={showTypePicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowTypePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Disaster Type</Text>
              {EMERGENCY_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={styles.optionItem}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, type: type.value }));
                    setShowTypePicker(false);
                  }}
                >
                  <MaterialCommunityIcons name={type.icon} size={24} color="#667eea" />
                  <Text style={styles.optionText}>{type.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowTypePicker(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Urgency Picker Modal */}
        <Modal
          visible={showUrgencyPicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowUrgencyPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Urgency Level</Text>
              {URGENCY_LEVELS.map((urgency) => (
                <TouchableOpacity
                  key={urgency.value}
                  style={styles.optionItem}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, urgency: urgency.value }));
                    setShowUrgencyPicker(false);
                  }}
                >
                  <View style={[styles.urgencyDot, { backgroundColor: urgency.color }]} />
                  <Text style={styles.optionText}>{urgency.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowUrgencyPicker(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  closeButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 100,
  },
  picker: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  urgencyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  submitButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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
    width: '85%',
    maxHeight: '70%',
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
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 15,
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