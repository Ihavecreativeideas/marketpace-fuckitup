import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Image,
  Switch,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { colors } from '../../utils/colors';
import { useAuth } from '../../context/AuthContext';
import RouteService from '../../services/routeService';
import PaymentManager from '../../components/driver/PaymentManager';
import DeliveryMethodSelector from '../../components/driver/DeliveryMethodSelector';
import { StripeProvider } from '@stripe/stripe-react-native';

export default function EnhancedDriverDashboard({ navigation }) {
  const { user } = useAuth();
  const [driverStatus, setDriverStatus] = useState('offline'); // offline, online, busy, paused
  const [currentRoute, setCurrentRoute] = useState(null);
  const [availableRoutes, setAvailableRoutes] = useState([]);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [earnings, setEarnings] = useState({ today: 0, week: 0, total: 0 });
  const [location, setLocation] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modals and UI state
  const [notificationModal, setNotificationModal] = useState({ visible: false, type: '', delivery: null });
  const [imageModal, setImageModal] = useState({ visible: false, delivery: null, image: null });
  const [bailModal, setBailModal] = useState({ visible: false, reason: '' });
  const [messageModal, setMessageModal] = useState({ visible: false, customer: null, message: '' });
  const [paymentModal, setPaymentModal] = useState({ visible: false, delivery: null });
  const [deliveryMethodModal, setDeliveryMethodModal] = useState({ visible: false, delivery: null });

  useEffect(() => {
    initializeDriver();
    requestLocationPermission();
  }, []);

  const initializeDriver = async () => {
    try {
      const [statsResponse, routesResponse] = await Promise.all([
        RouteService.getDriverStats(),
        RouteService.getAvailableRoutes()
      ]);
      
      setEarnings({
        today: statsResponse.todayEarnings,
        week: statsResponse.weeklyEarnings,
        total: statsResponse.totalEarnings
      });
      setAvailableRoutes(routesResponse);
      setDriverStatus(statsResponse.status);
    } catch (error) {
      console.error('Failed to initialize driver data:', error);
    }
  };

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
    }
  };

  const toggleDriverStatus = async () => {
    const newStatus = driverStatus === 'online' ? 'offline' : 'online';
    try {
      await RouteService.updateDriverStatus(newStatus);
      setDriverStatus(newStatus);
      if (newStatus === 'online') {
        loadNearbyRoutes();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const loadNearbyRoutes = async () => {
    if (!location) return;
    try {
      const response = await RouteService.getNearbyRoutes(location.latitude, location.longitude);
      setAvailableRoutes(response.routes);
    } catch (error) {
      console.error('Failed to load nearby routes:', error);
    }
  };

  const acceptRoute = async (routeId) => {
    try {
      const route = await RouteService.acceptRoute(routeId);
      setCurrentRoute(route);
      setDriverStatus('busy');
      Alert.alert('Route Accepted', 'You can now start pickups 15 minutes before the scheduled time.');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const startRoute = () => {
    if (!currentRoute) return;
    setDriverStatus('busy');
    // Initialize deliveries from route
    const deliveries = currentRoute.deliveries?.map(delivery => ({
      ...delivery,
      status: 'pending',
      estimatedTime: new Date(Date.now() + 30 * 60 * 1000), // 30 min estimate
    })) || [];
    setActiveDeliveries(deliveries);
  };

  const pauseRoute = () => {
    setDriverStatus('paused');
    Alert.alert('Route Paused', 'Your route has been paused. Tap resume when ready to continue.');
  };

  const resumeRoute = () => {
    setDriverStatus('busy');
  };

  const bailOnRoute = async () => {
    setBailModal({ visible: true, reason: '' });
  };

  const confirmBail = async () => {
    try {
      // Send route back to job board
      await RouteService.bailRoute(currentRoute.id, bailModal.reason);
      setCurrentRoute(null);
      setActiveDeliveries([]);
      setDriverStatus('online');
      setBailModal({ visible: false, reason: '' });
      Alert.alert('Route Transferred', 'Your route has been returned to the job board for another driver.');
    } catch (error) {
      Alert.alert('Error', 'Failed to transfer route');
    }
  };

  const notifyStatus = (type, delivery) => {
    setNotificationModal({ visible: true, type, delivery });
  };

  const sendNotification = async () => {
    const { type, delivery } = notificationModal;
    try {
      await RouteService.updateDeliveryStatus(delivery.id, type);
      
      // Update delivery status and ETA
      setActiveDeliveries(prev => prev.map(d => 
        d.id === delivery.id 
          ? { 
              ...d, 
              status: type,
              actualTime: new Date(),
              estimatedTime: type === 'picked_up' 
                ? new Date(Date.now() + 20 * 60 * 1000) // 20 min to delivery
                : d.estimatedTime
            }
          : d
      ));
      
      setNotificationModal({ visible: false, type: '', delivery: null });
      Alert.alert('Notification Sent', `Customer has been notified: ${type.replace('_', ' ')}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to send notification');
    }
  };

  const takePickupPhoto = async (delivery) => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageModal({ 
        visible: true, 
        delivery, 
        image: result.assets[0] 
      });
    }
  };

  const sendPhotoToBuyer = async () => {
    const { delivery, image } = imageModal;
    try {
      await RouteService.sendPickupPhoto(delivery.id, image.uri);
      setImageModal({ visible: false, delivery: null, image: null });
      Alert.alert('Photo Sent', 'Pickup confirmation photo sent to buyer');
    } catch (error) {
      Alert.alert('Error', 'Failed to send photo');
    }
  };

  const handleBuyerRejection = async (delivery) => {
    Alert.alert(
      'Item Rejected',
      'Buyer has rejected this item. They will still pay their half of the delivery fee.',
      [
        { text: 'Return to Seller', onPress: () => returnToSeller(delivery) },
        { text: 'Mark as Complete', onPress: () => completeRejectedDelivery(delivery) }
      ]
    );
  };

  const returnToSeller = async (delivery) => {
    try {
      await RouteService.returnToSeller(delivery.id);
      // Buyer pays their delivery fee portion
      Alert.alert('Return Initiated', 'Item will be returned to seller. Buyer charged delivery fee.');
    } catch (error) {
      Alert.alert('Error', 'Failed to process return');
    }
  };

  const completeDelivery = async (delivery, isLate = false) => {
    // Show payment processing first
    setPaymentModal({ visible: true, delivery: { ...delivery, isLate } });
  };

  const handlePaymentComplete = async (paymentBreakdown) => {
    try {
      const delivery = paymentModal.delivery;
      await RouteService.completeDelivery(delivery.id, delivery.isLate);
      
      setActiveDeliveries(prev => prev.filter(d => d.id !== delivery.id));
      setPaymentModal({ visible: false, delivery: null });
      
      // Update earnings
      setEarnings(prev => ({
        ...prev,
        today: prev.today + paymentBreakdown.driverTotal
      }));
      
      // Check if route is complete
      if (activeDeliveries.length === 1) {
        setCurrentRoute(null);
        setDriverStatus('online');
        Alert.alert('Route Complete!', 'All deliveries completed. Great job!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to complete delivery');
    }
  };

  const showDeliveryMethodSelector = (delivery) => {
    setDeliveryMethodModal({ visible: true, delivery });
  };

  const handleDeliveryMethodSelected = async (method, delivery) => {
    try {
      await RouteService.updateDeliveryMethod(delivery.id, method.id);
      Alert.alert('Method Updated', `Delivery method changed to: ${method.title}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update delivery method');
    }
  };

  const messageCustomer = (customer) => {
    setMessageModal({ visible: true, customer, message: '' });
  };

  const sendCustomerMessage = async () => {
    try {
      await RouteService.messageCustomer(
        messageModal.customer.id, 
        messageModal.message,
        -2.00 // $2 discount for early delivery
      );
      setMessageModal({ visible: false, customer: null, message: '' });
      Alert.alert('Message Sent', 'Customer has been notified about early delivery option');
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const formatEarnings = (amount) => `$${amount.toFixed(2)}`;

  const getStatusColor = () => {
    switch (driverStatus) {
      case 'online': return colors.success;
      case 'busy': return colors.info;
      case 'paused': return colors.warning;
      default: return colors.gray;
    }
  };

  const renderAvailableRoute = ({ item: route }) => (
    <View style={styles.routeCard}>
      <View style={styles.routeHeader}>
        <Text style={styles.routeTitle}>Route #{route.id}</Text>
        <Text style={styles.routeTime}>{route.timeSlot}</Text>
      </View>
      
      <View style={styles.routeDetails}>
        <Text style={styles.routeText}>
          {route.pickups} pickups • {route.dropoffs} deliveries
        </Text>
        <Text style={styles.routeText}>
          {route.mileage} miles • {formatEarnings(route.earnings)}
        </Text>
        {route.distance && (
          <Text style={[styles.routeText, { color: colors.info }]}>
            {route.distance.toFixed(1)} miles away
          </Text>
        )}
      </View>

      <View style={styles.routeActions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => acceptRoute(route.id)}
        >
          <Text style={styles.primaryButtonText}>Accept Route</Text>
        </TouchableOpacity>
        
        {route.customers && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => messageCustomer(route.customers[0])}
          >
            <Ionicons name="chatbubble" size={16} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>Message</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderActiveDelivery = ({ item: delivery }) => (
    <View style={styles.deliveryCard}>
      <View style={styles.deliveryHeader}>
        <Text style={styles.deliveryTitle}>
          Delivery #{delivery.id}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getDeliveryStatusColor(delivery.status) }]}>
          <Text style={styles.statusText}>{delivery.status.replace('_', ' ').toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.deliveryAddress}>
        📍 {delivery.pickupAddress} → {delivery.deliveryAddress}
      </Text>
      
      <Text style={styles.deliveryETA}>
        ETA: {delivery.estimatedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>

      <View style={styles.deliveryActions}>
        {delivery.status === 'pending' && (
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => notifyStatus('en_route', delivery)}
            >
              <Ionicons name="car" size={16} color={colors.white} />
              <Text style={styles.actionButtonText}>En Route</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => takePickupPhoto(delivery)}
            >
              <Ionicons name="camera" size={16} color={colors.white} />
              <Text style={styles.actionButtonText}>Photo</Text>
            </TouchableOpacity>
          </>
        )}

        {delivery.status === 'en_route' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => notifyStatus('picked_up', delivery)}
          >
            <Ionicons name="checkmark" size={16} color={colors.white} />
            <Text style={styles.actionButtonText}>Picked Up</Text>
          </TouchableOpacity>
        )}

        {delivery.status === 'picked_up' && (
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => notifyStatus('delivering', delivery)}
            >
              <Ionicons name="navigate" size={16} color={colors.white} />
              <Text style={styles.actionButtonText}>Delivering</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => handleBuyerRejection(delivery)}
            >
              <Text style={styles.secondaryButtonText}>Rejected</Text>
            </TouchableOpacity>
          </>
        )}

        {delivery.status === 'delivering' && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.success }]}
              onPress={() => completeDelivery(delivery)}
            >
              <Ionicons name="checkmark-circle" size={16} color={colors.white} />
              <Text style={styles.actionButtonText}>Complete & Pay</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => showDeliveryMethodSelector(delivery)}
            >
              <Ionicons name="options" size={16} color={colors.primary} />
              <Text style={styles.secondaryButtonText}>Method</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  const getDeliveryStatusColor = (status) => {
    switch (status) {
      case 'pending': return colors.gray;
      case 'en_route': return colors.info;
      case 'picked_up': return colors.warning;
      case 'delivering': return colors.primary;
      case 'completed': return colors.success;
      default: return colors.gray;
    }
  };

  return (
    <StripeProvider publishableKey={process.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_...'}>
      <SafeAreaView style={styles.container}>
      {/* Header with status toggle */}
      <View style={styles.header}>
        <View style={styles.statusSection}>
          <Text style={styles.statusLabel}>Driver Status</Text>
          <View style={styles.statusToggle}>
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {driverStatus.toUpperCase()}
            </Text>
            <Switch
              value={driverStatus === 'online' || driverStatus === 'busy' || driverStatus === 'paused'}
              onValueChange={toggleDriverStatus}
              trackColor={{ false: colors.lightGray, true: colors.success }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        <View style={styles.earningsSection}>
          <Text style={styles.earningsLabel}>Today: {formatEarnings(earnings.today)}</Text>
          <Text style={styles.earningsLabel}>Week: {formatEarnings(earnings.week)}</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={initializeDriver} />
        }
      >
        {/* Current Route Section */}
        {currentRoute && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Route</Text>
            <View style={styles.currentRouteCard}>
              <Text style={styles.currentRouteTitle}>Route #{currentRoute.id}</Text>
              <Text style={styles.currentRouteDetails}>
                {currentRoute.pickups} pickups • {currentRoute.dropoffs} deliveries
              </Text>
              
              <View style={styles.routeControls}>
                {driverStatus === 'online' && (
                  <TouchableOpacity style={styles.startButton} onPress={startRoute}>
                    <Text style={styles.startButtonText}>Start Route</Text>
                  </TouchableOpacity>
                )}
                
                {driverStatus === 'busy' && (
                  <TouchableOpacity style={styles.pauseButton} onPress={pauseRoute}>
                    <Ionicons name="pause" size={16} color={colors.white} />
                    <Text style={styles.pauseButtonText}>Pause</Text>
                  </TouchableOpacity>
                )}
                
                {driverStatus === 'paused' && (
                  <TouchableOpacity style={styles.resumeButton} onPress={resumeRoute}>
                    <Ionicons name="play" size={16} color={colors.white} />
                    <Text style={styles.resumeButtonText}>Resume</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity style={styles.bailButton} onPress={bailOnRoute}>
                  <Ionicons name="exit" size={16} color={colors.white} />
                  <Text style={styles.bailButtonText}>Bail</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Active Deliveries */}
        {activeDeliveries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Deliveries</Text>
            <FlatList
              data={activeDeliveries}
              renderItem={renderActiveDelivery}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Available Routes */}
        {driverStatus === 'online' && !currentRoute && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Routes</Text>
            <FlatList
              data={availableRoutes}
              renderItem={renderAvailableRoute}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>

      {/* Notification Modal */}
      <Modal visible={notificationModal.visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Send Notification</Text>
            <Text style={styles.modalText}>
              Notify customer that you are {notificationModal.type.replace('_', ' ')}?
            </Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setNotificationModal({ visible: false, type: '', delivery: null })}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.confirmButton} onPress={sendNotification}>
                <Text style={styles.confirmButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Image Modal */}
      <Modal visible={imageModal.visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Pickup</Text>
            
            {imageModal.image && (
              <Image source={{ uri: imageModal.image.uri }} style={styles.previewImage} />
            )}
            
            <Text style={styles.modalText}>
              Send this photo to buyer to confirm correct item?
            </Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setImageModal({ visible: false, delivery: null, image: null })}
              >
                <Text style={styles.cancelButtonText}>Retake</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.confirmButton} onPress={sendPhotoToBuyer}>
                <Text style={styles.confirmButtonText}>Send Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bail Modal */}
      <Modal visible={bailModal.visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Bail on Route</Text>
            <Text style={styles.modalText}>
              This will return your route to the job board for another driver.
            </Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="Reason for bailing (optional)"
              value={bailModal.reason}
              onChangeText={(text) => setBailModal({ ...bailModal, reason: text })}
              multiline
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setBailModal({ visible: false, reason: '' })}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.bailConfirmButton} onPress={confirmBail}>
                <Text style={styles.bailConfirmButtonText}>Confirm Bail</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Message Modal */}
      <Modal visible={messageModal.visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Message Customer</Text>
            <Text style={styles.modalText}>
              Offer earlier delivery with $2 discount?
            </Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="Custom message (optional)"
              value={messageModal.message}
              onChangeText={(text) => setMessageModal({ ...messageModal, message: text })}
              multiline
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setMessageModal({ visible: false, customer: null, message: '' })}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.confirmButton} onPress={sendCustomerMessage}>
                <Text style={styles.confirmButtonText}>Send Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Manager Modal */}
      <PaymentManager
        delivery={paymentModal.delivery}
        visible={paymentModal.visible}
        onClose={() => setPaymentModal({ visible: false, delivery: null })}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* Delivery Method Selector */}
      <DeliveryMethodSelector
        delivery={deliveryMethodModal.delivery}
        visible={deliveryMethodModal.visible}
        onClose={() => setDeliveryMethodModal({ visible: false, delivery: null })}
        onMethodSelected={(method) => handleDeliveryMethodSelected(method, deliveryMethodModal.delivery)}
      />
    </SafeAreaView>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  statusSection: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 4,
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  earningsSection: {
    alignItems: 'flex-end',
  },
  earningsLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  currentRouteCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  currentRouteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  currentRouteDetails: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 16,
  },
  routeControls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  startButton: {
    backgroundColor: colors.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  startButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  pauseButton: {
    backgroundColor: colors.warning,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pauseButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 4,
  },
  resumeButton: {
    backgroundColor: colors.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resumeButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 4,
  },
  bailButton: {
    backgroundColor: colors.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bailButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 4,
  },
  routeCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  routeTime: {
    fontSize: 14,
    color: colors.gray,
  },
  routeDetails: {
    marginBottom: 16,
  },
  routeText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  routeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  deliveryCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '600',
  },
  deliveryAddress: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  deliveryETA: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 16,
  },
  deliveryActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  bailConfirmButton: {
    backgroundColor: colors.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  bailConfirmButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});