import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function DirectionsModal({ 
  visible, 
  onClose, 
  destinationCoords, 
  destinationAddress,
  requestType = 'emergency'
}) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  useEffect(() => {
    if (visible && destinationCoords && destinationCoords.latitude && destinationCoords.longitude) {
      getCurrentLocation();
    } else if (visible) {
      Alert.alert(
        'Navigation Error', 
        'Emergency location coordinates are not available for this request.',
        [{ text: 'OK', onPress: onClose }]
      );
    }
  }, [visible, destinationCoords]);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        // Add timeout to prevent hanging
        const locationPromise = Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced, // Use Balanced instead of High for faster response
          timeout: 10000, // 10 second timeout
        });
        
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Location timeout')), 12000)
        );
        
        const location = await Promise.race([locationPromise, timeoutPromise]);
        
        const currentCoords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        
        setCurrentLocation(currentCoords);
        calculateRoute(currentCoords, destinationCoords);
      } else {
        Alert.alert('Location Permission', 'Location access is required for navigation');
        setLoading(false);
      }
    } catch (error) {
      console.error('Location error:', error);
      
      if (error.message === 'Location timeout') {
        // Fallback: Use a default location or last known location
        Alert.alert(
          'Location Timeout', 
          'Unable to get your current location. You can still navigate using external apps.',
          [
            { text: 'OK', onPress: () => setLoading(false) },
            { text: 'Open Maps', onPress: () => { setLoading(false); openExternalMaps(); } }
          ]
        );
      } else {
        Alert.alert('Location Error', 'Could not get your current location. You can still use external navigation apps.');
        setLoading(false);
      }
    }
  };

  const calculateRoute = async (origin, destination) => {
    try {
      // Simple straight-line route for now (you can integrate Google Directions API here)
      const route = [origin, destination];
      setRoute(route);
      
      // Calculate approximate distance
      const dist = calculateDistance(origin, destination);
      setDistance(dist);
      setDuration(Math.round(dist * 2)); // Rough estimate: 2 minutes per km
    } catch (error) {
      console.error('Route calculation error:', error);
    }
  };

  const calculateDistance = (coord1, coord2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  const openExternalMaps = () => {
    if (!destinationCoords) return;

    const { latitude, longitude } = destinationCoords;
    const destination = `${latitude},${longitude}`;
    
    Alert.alert(
      'Open Navigation',
      'Choose your preferred navigation app:',
      [
        {
          text: 'Google Maps',
          onPress: () => {
            const url = Platform.select({
              ios: `comgooglemaps://?daddr=${destination}&directionsmode=driving`,
              android: `google.navigation:q=${destination}`,
            });
            
            Linking.canOpenURL(url)
              .then((supported) => {
                if (supported) {
                  Linking.openURL(url);
                } else {
                  // Fallback to web version
                  const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
                  Linking.openURL(webUrl);
                }
              })
              .catch(() => {
                const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
                Linking.openURL(webUrl);
              });
          },
        },
        {
          text: 'Apple Maps',
          onPress: () => {
            const url = `http://maps.apple.com/?daddr=${destination}&dirflg=d`;
            Linking.openURL(url);
          },
        },
        {
          text: 'Waze',
          onPress: () => {
            const url = `waze://?ll=${destination}&navigate=yes`;
            Linking.canOpenURL(url)
              .then((supported) => {
                if (supported) {
                  Linking.openURL(url);
                } else {
                  Alert.alert('Waze not installed', 'Please install Waze app for navigation');
                }
              });
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const getMapRegion = () => {
    if (!currentLocation || !destinationCoords) {
      return {
        latitude: destinationCoords?.latitude || 37.78825,
        longitude: destinationCoords?.longitude || -122.4324,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    const minLat = Math.min(currentLocation.latitude, destinationCoords.latitude);
    const maxLat = Math.max(currentLocation.latitude, destinationCoords.latitude);
    const minLng = Math.min(currentLocation.longitude, destinationCoords.longitude);
    const maxLng = Math.max(currentLocation.longitude, destinationCoords.longitude);

    const deltaLat = maxLat - minLat;
    const deltaLng = maxLng - minLng;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(deltaLat * 1.5, 0.01),
      longitudeDelta: Math.max(deltaLng * 1.5, 0.01),
    };
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
          <Text style={styles.title}>Navigation</Text>
          <TouchableOpacity onPress={openExternalMaps} style={styles.externalButton}>
            <MaterialCommunityIcons name="open-in-app" size={20} color="#667eea" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Getting your location...</Text>
            <TouchableOpacity 
              style={styles.skipLocationButton}
              onPress={() => {
                setLoading(false);
                openExternalMaps();
              }}
            >
              <Text style={styles.skipLocationText}>Skip & Open Maps</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <MapView
              style={styles.map}
              initialRegion={getMapRegion()}
              showsUserLocation={true}
              showsMyLocationButton={false}
            >
              {/* Current Location Marker */}
              {currentLocation && (
                <Marker
                  coordinate={currentLocation}
                  title="Your Location"
                  description="Current position"
                >
                  <View style={styles.currentLocationMarker}>
                    <MaterialCommunityIcons name="account-circle" size={24} color="#667eea" />
                  </View>
                </Marker>
              )}

              {/* Destination Marker */}
              {destinationCoords && (
                <Marker
                  coordinate={destinationCoords}
                  title="Emergency Location"
                  description={destinationAddress || "Destination"}
                >
                  <View style={styles.emergencyMarker}>
                    <MaterialCommunityIcons name="alert" size={24} color="white" />
                  </View>
                </Marker>
              )}

              {/* Route Line */}
              {route && (
                <Polyline
                  coordinates={route}
                  strokeColor="#667eea"
                  strokeWidth={4}
                  lineDashPattern={[5, 5]}
                />
              )}
            </MapView>

            {/* Route Info */}
            <View style={styles.routeInfo}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.routeInfoGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.routeDetails}>
                  <View style={styles.routeItem}>
                    <MaterialCommunityIcons name="map-marker-distance" size={20} color="white" />
                    <Text style={styles.routeText}>
                      {distance ? `${distance.toFixed(1)} km` : 'Calculating...'}
                    </Text>
                  </View>
                  <View style={styles.routeItem}>
                    <MaterialCommunityIcons name="clock-outline" size={20} color="white" />
                    <Text style={styles.routeText}>
                      {duration ? `~${duration} min` : 'Calculating...'}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity style={styles.navigateButton} onPress={openExternalMaps}>
                  <MaterialCommunityIcons name="navigation" size={20} color="white" />
                  <Text style={styles.navigateText}>Navigate</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>

            {/* Emergency Info */}
            <View style={styles.emergencyInfo}>
              <Text style={styles.emergencyTitle}>Emergency Location</Text>
              <Text style={styles.emergencyAddress}>
                {destinationAddress || `${destinationCoords?.latitude.toFixed(4)}, ${destinationCoords?.longitude.toFixed(4)}`}
              </Text>
              <Text style={styles.emergencyNote}>
                🚨 This is an active emergency location. Please proceed with caution and follow safety protocols.
              </Text>
            </View>
          </>
        )}
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
  externalButton: {
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
  skipLocationButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#667eea',
    borderRadius: 8,
  },
  skipLocationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
  },
  currentLocationMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  emergencyMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  routeInfo: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  routeInfoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  routeDetails: {
    flex: 1,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  routeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  navigateText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emergencyInfo: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  emergencyAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  emergencyNote: {
    fontSize: 12,
    color: '#e74c3c',
    fontStyle: 'italic',
    lineHeight: 16,
  },
});