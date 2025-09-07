import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Disaster type icons and colors
const TYPE_ICONS = {
  flood: 'waves',
  earthquake: 'vibrate',
  landslide: 'image-broken-variant',
  tsunami: 'waves',
  wildfire: 'fire',
  cyclone: 'weather-hurricane',
  drought: 'weather-sunny-alert',
  other: 'alert',
};

const TYPE_COLORS = {
  flood: '#3498db',
  earthquake: '#e74c3c',
  landslide: '#f39c12',
  tsunami: '#9b59b6',
  wildfire: '#e67e22',
  cyclone: '#95a5a6',
  drought: '#f1c40f',
  other: '#34495e',
};

const URGENCY_COLORS = {
  low: '#27ae60',
  medium: '#f39c12',
  high: '#e67e22',
  critical: '#e74c3c',
};

const STATUS_COLORS = {
  pending: '#f39c12',
  assigned: '#3498db',
  in_progress: '#9b59b6',
  completed: '#27ae60',
  cancelled: '#95a5a6',
};

export default function RequestsMapView({ requests, onRequestSelect, userRole, style }) {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [mapRef, setMapRef] = useState(null);

  // Default region (can be customized)
  const defaultRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Calculate region to fit all markers
  const getMapRegion = () => {
    if (!requests || requests.length === 0) {
      return defaultRegion;
    }

    const validRequests = requests.filter(req => req.coordinates);
    
    if (validRequests.length === 0) {
      return defaultRegion;
    }

    const latitudes = validRequests.map(req => req.coordinates.latitude);
    const longitudes = validRequests.map(req => req.coordinates.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const deltaLat = maxLat - minLat;
    const deltaLng = maxLng - minLng;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(deltaLat * 1.5, 0.01),
      longitudeDelta: Math.max(deltaLng * 1.5, 0.01),
    };
  };

  const handleMarkerPress = (request) => {
    setSelectedRequest(request);
    if (onRequestSelect) {
      onRequestSelect(request);
    }
  };

  const fitToMarkers = () => {
    if (mapRef && requests && requests.length > 0) {
      const validRequests = requests.filter(req => req.coordinates);
      if (validRequests.length > 0) {
        mapRef.fitToCoordinates(
          validRequests.map(req => req.coordinates),
          {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          }
        );
      }
    }
  };

  const renderMarker = (request) => {
    if (!request.coordinates) return null;

    const disasterColor = TYPE_COLORS[request.type] || TYPE_COLORS.other;
    const urgencyColor = URGENCY_COLORS[request.urgency] || URGENCY_COLORS.medium;
    
    return (
      <Marker
        key={request.id}
        coordinate={request.coordinates}
        onPress={() => handleMarkerPress(request)}
      >
        <View style={[styles.markerContainer, { borderColor: urgencyColor }]}>
          <LinearGradient
            colors={[disasterColor, `${disasterColor}CC`]}
            style={styles.markerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons
              name={TYPE_ICONS[request.type] || 'alert'}
              size={20}
              color="white"
            />
          </LinearGradient>
          {request.urgency === 'critical' && (
            <View style={styles.pulseRing} />
          )}
        </View>

        <Callout style={styles.callout}>
          <View style={styles.calloutContainer}>
            <View style={styles.calloutHeader}>
              <Text style={styles.calloutTitle}>
                {request.type.charAt(0).toUpperCase() + request.type.slice(1)} Emergency
              </Text>
              <View style={[styles.urgencyBadge, { backgroundColor: urgencyColor }]}>
                <Text style={styles.urgencyText}>{request.urgency.toUpperCase()}</Text>
              </View>
            </View>
            
            <Text style={styles.calloutDescription} numberOfLines={2}>
              {request.description}
            </Text>
            
            <View style={styles.calloutDetails}>
              <View style={styles.calloutDetailItem}>
                <MaterialCommunityIcons name="map-marker" size={14} color="#666" />
                <Text style={styles.calloutDetailText} numberOfLines={1}>
                  {request.address || 'Location unavailable'}
                </Text>
              </View>
              
              <View style={styles.calloutDetailItem}>
                <MaterialCommunityIcons name="clock-outline" size={14} color="#666" />
                <Text style={styles.calloutDetailText}>
                  {new Date(request.createdAt).toLocaleDateString()}
                </Text>
              </View>
              
              <View style={styles.calloutDetailItem}>
                <MaterialCommunityIcons 
                  name={request.status === 'pending' ? 'clock-alert' : 'check-circle'} 
                  size={14} 
                  color={STATUS_COLORS[request.status]} 
                />
                <Text style={[styles.calloutDetailText, { color: STATUS_COLORS[request.status] }]}>
                  {request.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>
            
            {userRole === 'volunteer' && request.status === 'pending' && (
              <TouchableOpacity style={styles.acceptButton}>
                <Text style={styles.acceptButtonText}>View Details</Text>
              </TouchableOpacity>
            )}
          </View>
        </Callout>
      </Marker>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={setMapRef}
        style={styles.map}
        initialRegion={getMapRegion()}
        showsUserLocation={true}
        showsMyLocationButton={false}
        onMapReady={fitToMarkers}
      >
        {requests && requests.map(renderMarker)}
      </MapView>

      {/* Map Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={fitToMarkers}>
          <MaterialCommunityIcons name="fit-to-screen-outline" size={20} color="#667eea" />
        </TouchableOpacity>
      </View>

      {/* Legend */}
      {requests && requests.length > 0 && (
        <View style={styles.legendContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.legend}>
              {Object.entries(URGENCY_COLORS).map(([urgency, color]) => (
                <View key={urgency} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: color }]} />
                  <Text style={styles.legendText}>{urgency}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Request Counter */}
      {requests && (
        <View style={styles.counterContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.counterGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <MaterialCommunityIcons name="map-marker-multiple" size={16} color="white" />
            <Text style={styles.counterText}>
              {requests.filter(r => r.coordinates).length} Locations
            </Text>
          </LinearGradient>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8faff',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  markerGradient: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(231, 76, 60, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(231, 76, 60, 0.5)',
  },
  callout: {
    width: 250,
  },
  calloutContainer: {
    padding: 10,
  },
  calloutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  urgencyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  calloutDescription: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 8,
    lineHeight: 18,
  },
  calloutDetails: {
    marginBottom: 8,
  },
  calloutDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  calloutDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    flex: 1,
  },
  acceptButton: {
    backgroundColor: '#667eea',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  controlsContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  legendContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  legend: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '600',
  },
  counterContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  counterGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  counterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
});