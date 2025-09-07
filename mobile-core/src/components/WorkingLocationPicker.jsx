import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  TextInput,
  ScrollView,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function WorkingLocationPicker({ onLocationSelect, onCancel, initialLocation }) {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('');
  const [manualMode, setManualMode] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [mapReady, setMapReady] = useState(false);

  // Default to San Francisco for consistent testing
  const defaultLocation = {
    latitude: 37.78825,
    longitude: -122.4324,
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      setLoading(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeout: 5000,
          });
          
          setCurrentLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          
          if (!initialLocation) {
            setSelectedLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
          }
        } catch (locationError) {
          console.log('Could not get location, using default');
          if (!initialLocation) {
            setSelectedLocation(defaultLocation);
          }
        }
      } else {
        if (!initialLocation) {
          setSelectedLocation(defaultLocation);
        }
      }
    } catch (error) {
      console.error('Location permission error:', error);
      if (!initialLocation) {
        setSelectedLocation(defaultLocation);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = async (event) => {
    const coordinate = event.nativeEvent.coordinate;
    console.log('Map pressed at:', coordinate);
    setSelectedLocation(coordinate);
    
    // Simple address format
    const simpleAddress = `${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)}`;
    setAddress(simpleAddress);
  };

  const handleConfirm = () => {
    if (manualMode) {
      if (!manualAddress.trim()) {
        Alert.alert('Error', 'Please enter an address');
        return;
      }
      onLocationSelect({
        coordinates: null,
        address: manualAddress.trim(),
      });
    } else {
      if (!selectedLocation) {
        Alert.alert('Error', 'Please select a location on the map');
        return;
      }
      onLocationSelect({
        coordinates: selectedLocation,
        address: address || `${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}`,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Getting Location...</Text>
          <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
            <MaterialCommunityIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Preparing map...</Text>
        </View>
      </View>
    );
  }

  if (manualMode) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setManualMode(false)} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Enter Location</Text>
          <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
            <MaterialCommunityIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          <View style={styles.manualInputContainer}>
            <MaterialCommunityIcons name="map-marker" size={40} color="#667eea" />
            <Text style={styles.manualTitle}>Enter Your Location</Text>
            <Text style={styles.manualSubtitle}>
              Please provide your current location or the location where help is needed
            </Text>
            
            <TextInput
              style={styles.manualInput}
              value={manualAddress}
              onChangeText={setManualAddress}
              placeholder="Enter address, landmark, or area name..."
              multiline
              textAlignVertical="top"
            />
            
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.confirmGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialCommunityIcons name="check" size={20} color="white" />
                <Text style={styles.confirmText}>Confirm Location</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <MaterialCommunityIcons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Select Location</Text>
        <TouchableOpacity onPress={() => setManualMode(true)} style={styles.manualButton}>
          <MaterialCommunityIcons name="keyboard" size={20} color="#667eea" />
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        {!mapReady && (
          <View style={styles.mapLoadingOverlay}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.mapLoadingText}>Loading map...</Text>
          </View>
        )}
        
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: selectedLocation?.latitude || currentLocation?.latitude || defaultLocation.latitude,
            longitude: selectedLocation?.longitude || currentLocation?.longitude || defaultLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onPress={handleMapPress}
          showsUserLocation={true}
          showsMyLocationButton={false}
          onMapReady={() => {
            console.log('Map is ready');
            setMapReady(true);
          }}
          onError={(error) => {
            console.error('Map error:', error);
            setMapReady(true); // Show map anyway
          }}
          mapType="standard"
          pitchEnabled={false}
          rotateEnabled={false}
          scrollEnabled={true}
          zoomEnabled={true}
        >
          {selectedLocation && (
            <Marker
              coordinate={selectedLocation}
              title="Emergency Location"
              description={address || "Selected location"}
            >
              <View style={styles.marker}>
                <MaterialCommunityIcons name="alert" size={20} color="white" />
              </View>
            </Marker>
          )}
        </MapView>
        
        {/* Map overlay info */}
        {selectedLocation && mapReady && (
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedTitle}>Selected Location</Text>
            <Text style={styles.selectedAddress}>
              {address || `${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}`}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.instruction}>
          {mapReady ? 'Tap on the map to select emergency location' : 'Loading map...'}
        </Text>
        
        <TouchableOpacity 
          style={[styles.confirmButton, !selectedLocation && styles.confirmButtonDisabled]} 
          onPress={handleConfirm}
          disabled={!selectedLocation}
        >
          <LinearGradient
            colors={selectedLocation ? ['#667eea', '#764ba2'] : ['#ccc', '#999']}
            style={styles.confirmGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <MaterialCommunityIcons name="check" size={20} color="white" />
            <Text style={styles.confirmText}>Confirm Location</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
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
  cancelButton: {
    padding: 5,
  },
  backButton: {
    padding: 5,
  },
  manualButton: {
    padding: 5,
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
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(248, 250, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  mapLoadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#667eea',
    fontWeight: '500',
  },
  marker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  selectedInfo: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  selectedAddress: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  confirmButton: {
    borderRadius: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  confirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  confirmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  manualInputContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  manualTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  manualSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  manualInput: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 100,
    marginBottom: 30,
  },
});