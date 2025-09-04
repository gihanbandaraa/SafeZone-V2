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
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../config/api';

const { width, height } = Dimensions.get('window');

const roleOptions = [
  { 
    label: 'Victim', 
    value: 'victim', 
    description: 'I need help during natural disasters',
    icon: 'person-outline',
    color: '#FF6B6B'
  },
  { 
    label: 'Volunteer', 
    value: 'volunteer', 
    description: 'I want to help during natural disasters',
    icon: 'heart-outline',
    color: '#4ECDC4'
  },
  { 
    label: 'Organization', 
    value: 'organization', 
    description: 'I represent a disaster relief organization',
    icon: 'business-outline',
    color: '#45B7D1'
  },
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
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
          'Success! 🎉',
          'Account created successfully! Please sign in with your new account.',
          [{ text: 'Sign In', onPress: () => navigation.navigate('Login') }]
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

  const selectedRole = roleOptions.find(option => option.value === formData.role);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Welcome')}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-add-outline" size={48} color="white" />
              </View>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join SafeZone community</Text>
            </View>
          </View>

          <ScrollView
            style={styles.formContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.form}>
              <View style={styles.nameRow}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Ionicons name="person-outline" size={20} color="#667eea" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    placeholderTextColor="#A0A0A0"
                    value={formData.firstName}
                    onChangeText={(value) => setFormData(prev => ({ ...prev, firstName: value }))}
                    autoComplete="given-name"
                  />
                </View>
                
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Ionicons name="person-outline" size={20} color="#667eea" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    placeholderTextColor="#A0A0A0"
                    value={formData.lastName}
                    onChangeText={(value) => setFormData(prev => ({ ...prev, lastName: value }))}
                    autoComplete="family-name"
                  />
                </View>
              </View>
              
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#667eea" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor="#A0A0A0"
                  value={formData.email}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, email: value }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#667eea" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Phone number (optional)"
                  placeholderTextColor="#A0A0A0"
                  value={formData.phone}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                />
              </View>
              
              <TouchableOpacity
                style={styles.rolePicker}
                onPress={() => setShowRolePicker(true)}
                activeOpacity={0.8}
              >
                <View style={styles.rolePickerContent}>
                  <Ionicons name={selectedRole.icon} size={20} color={selectedRole.color} style={styles.inputIcon} />
                  <View style={styles.roleTextContainer}>
                    <Text style={styles.rolePickerLabel}>Role</Text>
                    <Text style={styles.rolePickerValue}>{selectedRole.label}</Text>
                    <Text style={styles.rolePickerDescription}>{selectedRole.description}</Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color="#667eea" />
                </View>
              </TouchableOpacity>
              
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#667eea" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password (min. 6 characters)"
                  placeholderTextColor="#A0A0A0"
                  value={formData.password}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, password: value }))}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#667eea"
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#667eea" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm password"
                  placeholderTextColor="#A0A0A0"
                  value={formData.confirmPassword}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, confirmPassword: value }))}
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="new-password"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#667eea"
                  />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {loading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Create Account</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.linkText}>
                  Already have an account? <Text style={styles.linkTextBold}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        
        <Modal
          visible={showRolePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowRolePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Choose Your Role</Text>
              <Text style={styles.modalSubtitle}>Select how you want to use SafeZone</Text>
              
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
                  activeOpacity={0.8}
                >
                  <View style={styles.roleOptionContent}>
                    <View style={[styles.roleIconContainer, { backgroundColor: `${option.color}15` }]}>
                      <Ionicons name={option.icon} size={24} color={option.color} />
                    </View>
                    <View style={styles.roleTextContainer}>
                      <Text style={[
                        styles.roleOptionTitle,
                        formData.role === option.value && styles.selectedRoleOptionTitle
                      ]}>
                        {option.label}
                      </Text>
                      <Text style={[
                        styles.roleOptionDescription,
                        formData.role === option.value && styles.selectedRoleOptionDescription
                      ]}>
                        {option.description}
                      </Text>
                    </View>
                    {formData.role === option.value && (
                      <Ionicons name="checkmark-circle" size={24} color={option.color} />
                    )}
                  </View>
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
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    paddingTop: height * 0.06,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    fontWeight: '300',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  scrollContent: {
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  form: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  halfWidth: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 18,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 4,
  },
  rolePicker: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  rolePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleTextContainer: {
    flex: 1,
  },
  rolePickerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rolePickerValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  rolePickerDescription: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },
  button: {
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 15,
    color: '#666',
  },
  linkTextBold: {
    fontWeight: '600',
    color: '#667eea',
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
    padding: 24,
    maxHeight: height * 0.7,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '300',
  },
  roleOption: {
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    backgroundColor: 'white',
  },
  selectedRoleOption: {
    borderColor: '#667eea',
    backgroundColor: '#F8F9FF',
  },
  roleOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  roleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  roleOptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedRoleOptionTitle: {
    color: '#667eea',
  },
  roleOptionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  selectedRoleOptionDescription: {
    color: '#667eea',
  },
  modalCancelButton: {
    paddingVertical: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});