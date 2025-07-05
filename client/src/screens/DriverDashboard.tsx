import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const { width } = Dimensions.get('window');

export default function DriverDashboard({ navigation }: any) {
  const [isOnline, setIsOnline] = useState(false);
  const { user } = useAuth();

  const { data: driverStats } = useQuery({
    queryKey: ['/api/driver-stats'],
    queryFn: () => apiRequest('GET', '/api/driver-stats'),
    enabled: !!user && user.userType === 'driver',
  });

  const { data: activeRoute } = useQuery({
    queryKey: ['/api/driver-active-route'],
    queryFn: () => apiRequest('GET', '/api/driver-active-route'),
    enabled: !!user && user.userType === 'driver' && isOnline,
  });

  const { data: availableOrders = [] } = useQuery({
    queryKey: ['/api/available-orders'],
    queryFn: () => apiRequest('GET', '/api/available-orders'),
    enabled: !!user && user.userType === 'driver' && isOnline,
  });

  // Color schemes for delivery routes
  const routeColors = [
    { pickup: '#1E3A8A', dropoff: '#3B82F6' }, // Blue
    { pickup: '#7C2D12', dropoff: '#EF4444' }, // Red
    { pickup: '#14532D', dropoff: '#22C55E' }, // Green
    { pickup: '#7C2D12', dropoff: '#F97316' }, // Orange
    { pickup: '#581C87', dropoff: '#A855F7' }, // Purple
    { pickup: '#0F172A', dropoff: '#64748B' }, // Slate
  ];

  const todaysEarnings = driverStats?.todaysEarnings || 0;
  const completedDeliveries = driverStats?.completedDeliveries || 0;
  const averageRating = driverStats?.averageRating || 5.0;

  const renderRouteStop = ({ item, index }: { item: any; index: number }) => {
    const colorScheme = routeColors[index % routeColors.length];
    
    return (
      <Card style={styles.stopCard}>
        <View style={styles.stopHeader}>
          <View style={[
            styles.stopIndicator,
            { backgroundColor: item.stopType === 'pickup' ? colorScheme.pickup : colorScheme.dropoff }
          ]}>
            <Ionicons 
              name={item.stopType === 'pickup' ? 'arrow-up' : 'arrow-down'} 
              size={16} 
              color="white" 
            />
          </View>
          <View style={styles.stopInfo}>
            <Text style={styles.stopType}>
              {item.stopType === 'pickup' ? 'Pick Up' : 'Drop Off'}
            </Text>
            <Text style={styles.stopOrder}>Stop #{item.stopOrder}</Text>
          </View>
          <Badge 
            text={item.isCompleted ? 'Completed' : 'Pending'} 
            variant={item.isCompleted ? 'success' : 'warning'} 
            size="small" 
          />
        </View>
        <Text style={styles.stopAddress}>{item.address}</Text>
        <Text style={styles.stopCustomer}>{item.customerName}</Text>
        {!item.isCompleted && (
          <View style={styles.stopActions}>
            <Button
              title="Navigate"
              onPress={() => handleNavigate(item)}
              size="small"
              style={styles.navigateButton}
            />
            <Button
              title="Complete"
              onPress={() => handleCompleteStop(item)}
              variant="outline"
              size="small"
              style={styles.completeButton}
            />
          </View>
        )}
      </Card>
    );
  };

  const renderAvailableOrder = ({ item }: { item: any }) => (
    <Card style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderTitle}>Order #{item.id}</Text>
        <Text style={styles.orderFee}>${item.deliveryFee}</Text>
      </View>
      <Text style={styles.orderDistance}>{item.distance} miles</Text>
      <View style={styles.orderRoute}>
        <View style={styles.orderStop}>
          <Ionicons name="storefront" size={16} color="#666" />
          <Text style={styles.orderStopText}>{item.pickupAddress}</Text>
        </View>
        <Ionicons name="arrow-down" size={16} color="#666" style={styles.orderArrow} />
        <View style={styles.orderStop}>
          <Ionicons name="home" size={16} color="#666" />
          <Text style={styles.orderStopText}>{item.deliveryAddress}</Text>
        </View>
      </View>
      <Button
        title="Accept Order"
        onPress={() => handleAcceptOrder(item)}
        size="small"
      />
    </Card>
  );

  const handleToggleOnline = () => {
    setIsOnline(!isOnline);
  };

  const handleNavigate = (stop: any) => {
    // Open navigation app
    console.log('Navigate to:', stop.address);
  };

  const handleCompleteStop = async (stop: any) => {
    try {
      await apiRequest('PUT', `/api/route-stops/${stop.id}/complete`);
      // Refresh data
    } catch (error) {
      console.error('Error completing stop:', error);
    }
  };

  const handleAcceptOrder = async (order: any) => {
    try {
      await apiRequest('POST', `/api/orders/${order.id}/accept`);
      // Refresh data
    } catch (error) {
      console.error('Error accepting order:', error);
    }
  };

  if (user?.userType !== 'driver') {
    return (
      <View style={styles.container}>
        <View style={styles.errorState}>
          <Ionicons name="car-outline" size={64} color="#ccc" />
          <Text style={styles.errorTitle}>Driver Access Required</Text>
          <Text style={styles.errorSubtitle}>
            You need to be approved as a driver to access this dashboard
          </Text>
          <Button
            title="Apply to be a Driver"
            onPress={() => navigation.navigate('DriverApplication')}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Driver Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            {isOnline ? 'You are online' : 'You are offline'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.onlineToggle, isOnline && styles.onlineToggleActive]}
          onPress={handleToggleOnline}
        >
          <Ionicons 
            name={isOnline ? 'radio-button-on' : 'radio-button-off'} 
            size={24} 
            color={isOnline ? '#4CAF50' : '#666'} 
          />
          <Text style={[styles.onlineText, isOnline && styles.onlineTextActive]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Earnings Summary */}
      <Card style={styles.earningsCard}>
        <Text style={styles.sectionTitle}>Today's Summary</Text>
        <View style={styles.earningsStats}>
          <View style={styles.earningsStat}>
            <Text style={styles.earningsAmount}>${todaysEarnings.toFixed(2)}</Text>
            <Text style={styles.earningsLabel}>Earned</Text>
          </View>
          <View style={styles.earningsStat}>
            <Text style={styles.earningsAmount}>{completedDeliveries}</Text>
            <Text style={styles.earningsLabel}>Deliveries</Text>
          </View>
          <View style={styles.earningsStat}>
            <Text style={styles.earningsAmount}>{averageRating}</Text>
            <Text style={styles.earningsLabel}>Rating</Text>
          </View>
        </View>
      </Card>

      {/* Active Route */}
      {isOnline && activeRoute && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Route</Text>
          <Card style={styles.routeCard}>
            <View style={styles.routeHeader}>
              <Text style={styles.routeTitle}>Route #{activeRoute.id}</Text>
              <Badge 
                text={`${activeRoute.completedStops}/${activeRoute.totalStops} stops`} 
                variant="info" 
              />
            </View>
            <Text style={styles.routeEarnings}>
              Estimated earnings: ${activeRoute.estimatedEarnings}
            </Text>
          </Card>
          
          <FlatList
            data={activeRoute.stops || []}
            renderItem={renderRouteStop}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* Available Orders */}
      {isOnline && !activeRoute && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Orders</Text>
          {availableOrders.length > 0 ? (
            <FlatList
              data={availableOrders}
              renderItem={renderAvailableOrder}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          ) : (
            <Card style={styles.emptyOrdersCard}>
              <Ionicons name="time-outline" size={48} color="#ccc" />
              <Text style={styles.emptyOrdersTitle}>No orders available</Text>
              <Text style={styles.emptyOrdersSubtitle}>
                New delivery requests will appear here
              </Text>
            </Card>
          )}
        </View>
      )}

      {/* Offline State */}
      {!isOnline && (
        <Card style={styles.offlineCard}>
          <Ionicons name="moon-outline" size={48} color="#666" />
          <Text style={styles.offlineTitle}>You're offline</Text>
          <Text style={styles.offlineSubtitle}>
            Go online to start receiving delivery requests
          </Text>
          <Button
            title="Go Online"
            onPress={handleToggleOnline}
            style={styles.goOnlineButton}
          />
        </Card>
      )}

      {/* Driver Resources */}
      <Card style={styles.resourcesCard}>
        <Text style={styles.sectionTitle}>Driver Resources</Text>
        <View style={styles.resourcesList}>
          <TouchableOpacity style={styles.resourceItem}>
            <Ionicons name="help-circle-outline" size={24} color="#007AFF" />
            <Text style={styles.resourceText}>Driver Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.resourceItem}>
            <Ionicons name="document-text-outline" size={24} color="#007AFF" />
            <Text style={styles.resourceText}>Driver Guidelines</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.resourceItem}>
            <Ionicons name="card-outline" size={24} color="#007AFF" />
            <Text style={styles.resourceText}>Earnings History</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  onlineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  onlineToggleActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  onlineText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  onlineTextActive: {
    color: '#4CAF50',
  },
  earningsCard: {
    margin: 16,
    backgroundColor: '#007AFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  earningsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  earningsStat: {
    alignItems: 'center',
  },
  earningsAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  earningsLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  routeCard: {
    marginBottom: 12,
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
    color: '#333',
  },
  routeEarnings: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  stopCard: {
    marginBottom: 12,
  },
  stopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stopIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stopInfo: {
    flex: 1,
  },
  stopType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  stopOrder: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  stopAddress: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    marginLeft: 44,
  },
  stopCustomer: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    marginLeft: 44,
  },
  stopActions: {
    flexDirection: 'row',
    marginLeft: 44,
  },
  navigateButton: {
    flex: 1,
    marginRight: 8,
  },
  completeButton: {
    flex: 1,
  },
  orderCard: {
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderFee: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  orderDistance: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  orderRoute: {
    marginBottom: 12,
  },
  orderStop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderStopText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  orderArrow: {
    alignSelf: 'center',
    marginLeft: 8,
    marginBottom: 8,
  },
  emptyOrdersCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyOrdersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyOrdersSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  offlineCard: {
    margin: 16,
    alignItems: 'center',
    paddingVertical: 40,
  },
  offlineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  offlineSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  goOnlineButton: {
    minWidth: 150,
  },
  resourcesCard: {
    margin: 16,
  },
  resourcesList: {
    marginTop: -16,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resourceText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
});
