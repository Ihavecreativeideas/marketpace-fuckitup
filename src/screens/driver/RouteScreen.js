import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Header from '../../components/common/Header';
import DeliveryItem from '../../components/driver/DeliveryItem';
import { colors } from '../../utils/colors';
import { api } from '../../services/api';

export default function RouteScreen({ navigation, route }) {
  const { routeId } = route.params;
  const [routeData, setRouteData] = useState(null);
  const [currentStop, setCurrentStop] = useState(0);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    loadRouteData();
  }, [routeId]);

  const loadRouteData = async () => {
    try {
      const response = await api.get(`/drivers/routes/${routeId}`);
      setRouteData(response.data);
      setCurrentStop(response.data.currentStop || 0);
      
      // Set map region to show all stops
      if (response.data.stops.length > 0) {
        const coordinates = response.data.stops.map(stop => ({
          latitude: stop.latitude,
          longitude: stop.longitude,
        }));
        
        const minLat = Math.min(...coordinates.map(c => c.latitude));
        const maxLat = Math.max(...coordinates.map(c => c.latitude));
        const minLng = Math.min(...coordinates.map(c => c.longitude));
        const maxLng = Math.max(...coordinates.map(c => c.longitude));
        
        setRegion({
          latitude: (minLat + maxLat) / 2,
          longitude: (minLng + maxLng) / 2,
          latitudeDelta: (maxLat - minLat) * 1.2,
          longitudeDelta: (maxLng - minLng) * 1.2,
        });
      }
    } catch (error) {
      console.error('Error loading route data:', error);
      Alert.alert('Error', 'Failed to load route data');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToStop = (stop) => {
    const destination = `${stop.latitude},${stop.longitude}`;
    const label = stop.type === 'pickup' ? 'Pickup Location' : 'Drop-off Location';
    
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
    });
    
    const latLng = `${stop.latitude},${stop.longitude}`;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });
    
    Linking.openURL(url);
  };

  const handleCompleteStop = async (stopIndex) => {
    try {
      await api.post(`/drivers/routes/${routeId}/stops/${stopIndex}/complete`);
      
      // Update local state
      const updatedRoute = { ...routeData };
      updatedRoute.stops[stopIndex].completed = true;
      setRouteData(updatedRoute);
      
      // Move to next stop
      const nextIncompleteStop = updatedRoute.stops.findIndex((stop, index) => 
        index > stopIndex && !stop.completed
      );
      
      if (nextIncompleteStop !== -1) {
        setCurrentStop(nextIncompleteStop);
        Alert.alert('Stop Completed', 'Moving to next stop');
      } else {
        // All stops completed
        Alert.alert(
          'Route Completed!',
          'You have completed all deliveries on this route. Great job!',
          [
            { text: 'OK', onPress: () => navigation.navigate('DriverDashboard') }
          ]
        );
      }
    } catch (error) {
      console.error('Error completing stop:', error);
      Alert.alert('Error', 'Failed to complete stop');
    }
  };

  const handleContactCustomer = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('No Phone Number', 'Customer phone number is not available');
    }
  };

  const getStopColor = (stop) => {
    if (stop.type === 'pickup') {
      return stop.completed ? colors.success : colors.primary;
    } else {
      return stop.completed ? colors.success : colors.warning;
    }
  };

  const getRouteProgress = () => {
    if (!routeData) return 0;
    const completed = routeData.stops.filter(stop => stop.completed).length;
    return (completed / routeData.stops.length) * 100;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Loading Route..." />
        <View style={styles.loadingContainer}>
          <Text>Loading route data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!routeData) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Route Not Found" />
        <View style={styles.errorContainer}>
          <Text>Route not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={`Route ${routeData.id}`}
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity onPress={() => Alert.alert('Help', 'Driver support features coming soon')}>
            <Ionicons name="help-circle-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content}>
        {/* Route Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Route Progress</Text>
            <Text style={styles.progressText}>
              {routeData.stops.filter(stop => stop.completed).length} of {routeData.stops.length} stops
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${getRouteProgress()}%` }]} />
          </View>
          <Text style={styles.earningsText}>
            Estimated Earnings: ${routeData.estimatedEarnings.toFixed(2)}
          </Text>
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
          >
            {routeData.stops.map((stop, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: stop.latitude,
                  longitude: stop.longitude,
                }}
                pinColor={getStopColor(stop)}
                title={stop.type === 'pickup' ? 'Pickup' : 'Drop-off'}
                description={stop.address}
              />
            ))}
            
            {/* Draw route line */}
            {routeData.stops.length > 1 && (
              <Polyline
                coordinates={routeData.stops.map(stop => ({
                  latitude: stop.latitude,
                  longitude: stop.longitude,
                }))}
                strokeColor={colors.primary}
                strokeWidth={3}
              />
            )}
          </MapView>
        </View>

        {/* Current Stop */}
        <View style={styles.currentStopContainer}>
          <Text style={styles.currentStopTitle}>Current Stop</Text>
          {routeData.stops[currentStop] && (
            <DeliveryItem
              item={routeData.stops[currentStop]}
              isActive={true}
              onNavigate={() => handleNavigateToStop(routeData.stops[currentStop])}
              onComplete={() => handleCompleteStop(currentStop)}
              onContact={() => handleContactCustomer(routeData.stops[currentStop].customerPhone)}
            />
          )}
        </View>

        {/* All Stops */}
        <View style={styles.allStopsContainer}>
          <Text style={styles.allStopsTitle}>All Stops</Text>
          {routeData.stops.map((stop, index) => (
            <DeliveryItem
              key={index}
              item={stop}
              isActive={index === currentStop}
              onNavigate={() => handleNavigateToStop(stop)}
              onComplete={() => handleCompleteStop(index)}
              onContact={() => handleContactCustomer(stop.customerPhone)}
            />
          ))}
        </View>

        {/* Route Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Driver Instructions</Text>
          <View style={styles.instructionItem}>
            <Ionicons name="information-circle" size={20} color={colors.info} />
            <Text style={styles.instructionText}>
              Complete pickups before drop-offs for the same order
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="time" size={20} color={colors.warning} />
            <Text style={styles.instructionText}>
              You have 5 minutes at each stop for customer confirmation
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="call" size={20} color={colors.success} />
            <Text style={styles.instructionText}>
              Call customer if they don't answer the door
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    backgroundColor: colors.white,
    padding: 16,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  progressText: {
    fontSize: 14,
    color: colors.gray,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  earningsText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600',
    textAlign: 'center',
  },
  mapContainer: {
    backgroundColor: colors.white,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  map: {
    height: 250,
  },
  currentStopContainer: {
    backgroundColor: colors.white,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  currentStopTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  allStopsContainer: {
    backgroundColor: colors.white,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  allStopsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  instructionsContainer: {
    backgroundColor: colors.white,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
});
