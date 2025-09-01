import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';

const API_BASE_URL = 'http://192.168.1.168:5000/api';

const roleOptions = [
  { label: 'Victim - Need Help', value: 'victim' },
  { label: 'Volunteer - Want to Help', value: 'volunteer' },
  { label: 'Organization - Relief Agency', value: 'organization' },
];

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'victim',
  });
  const [loading, setLoading] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);

  const handleRegister = async () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Success',
          'Account created successfully! Please login.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert('Registration Failed', data.message || 'Registration failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="First Name *"
          value={formData.firstName}
          onChangeText={(value) => setFormData(prev => ({ ...prev, firstName: value }))}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Last Name *"
          value={formData.lastName}
          onChangeText={(value) => setFormData(prev => ({ ...prev, lastName: value }))}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Email *"
          value={formData.email}
          onChangeText={(value) => setFormData(prev => ({ ...prev, email: value }))}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Phone"
          value={formData.phone}
          onChangeText={(value) => setFormData(prev => ({ ...prev, phone: value }))}
          keyboardType="phone-pad"
        />
        
        <TouchableOpacity
          style={styles.rolePicker}
          onPress={() => setShowRolePicker(true)}
        >
          <Text style={styles.rolePickerLabel}>Role:</Text>
          <Text style={styles.rolePickerValue}>
            {roleOptions.find(option => option.value === formData.role)?.label}
          </Text>
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          placeholder="Password *"
          value={formData.password}
          onChangeText={(value) => setFormData(prev => ({ ...prev, password: value }))}
          secureTextEntry
        />
        
        <TextInput
          style={styles.input}
          placeholder="Confirm Password *"
          value={formData.confirmPassword}
          onChangeText={(value) => setFormData(prev => ({ ...prev, confirmPassword: value }))}
          secureTextEntry
        />
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
      
      <Modal
        visible={showRolePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRolePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Your Role</Text>
            {roleOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.roleOption,
                  formData.role === option.value && styles.selectedRoleOption
                ]}
                onPress={() => {
                  setFormData(prev => ({ ...prev, role: option.value }));
                  setShowRolePicker(false);
                }}
              >
                <Text style={[
                  styles.roleOptionText,
                  formData.role === option.value && styles.selectedRoleOptionText
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowRolePicker(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 50,
    color: '#2196F3',
  },
  form: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  rolePicker: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  rolePickerLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  rolePickerValue: {
    fontSize: 16,
    color: '#2196F3',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  roleOption: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedRoleOption: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  roleOptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  selectedRoleOptionText: {
    color: 'white',
    fontWeight: 'bold',
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
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  linkText: {
    color: '#2196F3',
    fontSize: 14,
  },
});