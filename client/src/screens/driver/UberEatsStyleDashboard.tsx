import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const { width } = Dimensions.get('window');

interface RouteOrder {
  id: number;
  type: 'pickup' | 'delivery';
  address: string;
  customerName: string;
  items: string[];
  earnings: number;
  stopNumber: number;
  coordinates: { lat: number; lng: number };
}

interface DeliveryRoute {
  id: number;
  timeSlot: string;
  status: string;
  colorCode: string;
  totalEarnings: number;
  basePay: number;
  mileagePay: number;
  tips: number;
  totalDistance: number;
  estimatedDuration: number;
  orders: RouteOrder[];
}

export default function UberEatsStyleDashboard({ navigation }: any) {
  const [isOnline, setIsOnline] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const timeSlots = [
    { value: '9am-12pm', label: '9:00 AM - 12:00 PM', icon: 'sunny' },
    { value: '12pm-3pm', label: '12:00 PM - 3:00 PM', icon: 'partly-sunny' },
    { value: '3pm-6pm', label: '3:00 PM - 6:00 PM', icon: 'cloudy' },
    { value: '6pm-9pm', label: '6:00 PM - 9:00 PM', icon: 'moon' },
  ];

  const { data: driverStats } = useQuery({
    queryKey: ['/api/driver-stats'],
    queryFn: () => apiRequest('GET', '/api/driver-stats'),
    enabled: !!user,
  });

  const { data: activeRoutes = [] } = useQuery({
    queryKey: ['/api/driver-active-routes'],
    queryFn: () => apiRequest('GET', '/api/driver-active-routes'),
    enabled: !!user && isOnline,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: availableRoutes = [] } = useQuery({
    queryKey: ['/api/available-routes', selectedTimeSlot],
    queryFn: () => apiRequest('GET', `/api/available-routes?timeSlot=${selectedTimeSlot}`),
    enabled: !!user && isOnline && !!selectedTimeSlot,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const toggleOnlineMutation = useMutation({
    mutationFn: (online: boolean) => apiRequest('POST', '/api/driver-status', { isOnline: online }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/driver-stats'] });
    },
  });

  const acceptRouteMutation = useMutation({
    mutationFn: (routeId: number) => apiRequest('POST', `/api/accept-route/${routeId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/driver-active-routes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/available-routes'] });
      Alert.alert('Route Accepted!', 'Start navigation to your first stop.');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to accept route');
    },
  });

  const completeStopMutation = useMutation({
    mutationFn: ({ routeId, stopIndex }: { routeId: number; stopIndex: number }) =>
      apiRequest('POST', `/api/complete-stop/${routeId}/${stopIndex}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/driver-active-routes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/driver-stats'] });
    },
  });

  const handleToggleOnline = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    toggleOnlineMutation.mutate(newStatus);
    
    if (newStatus && !selectedTimeSlot) {
      // Auto-select current time slot
      const currentHour = new Date().getHours();
      if (currentHour >= 9 && currentHour < 12) setSelectedTimeSlot('9am-12pm');
      else if (currentHour >= 12 && currentHour < 15) setSelectedTimeSlot('12pm-3pm');
      else if (currentHour >= 15 && currentHour < 18) setSelectedTimeSlot('3pm-6pm');
      else if (currentHour >= 18 && currentHour < 21) setSelectedTimeSlot('6pm-9pm');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    queryClient.invalidateQueries().then(() => setRefreshing(false));
  };

  const getRouteColorScheme = (colorCode: string) => {
    const schemes = {
      blue: { pickup: '#1E3A8A', delivery: '#3B82F6' },
      red: { pickup: '#7C2D12', delivery: '#EF4444' },
      green: { pickup: '#14532D', delivery: '#22C55E' },
      orange: { pickup: '#EA580C', delivery: '#F97316' },
      purple: { pickup: '#581C87', delivery: '#A855F7' },
      slate: { pickup: '#0F172A', delivery: '#64748B' },
    };
    return schemes[colorCode as keyof typeof schemes] || schemes.blue;
  };

  const formatEarnings = (amount: number) => `$${amount.toFixed(2)}`;

  const renderEarningsCard = () => (
    <Card style={styles.earningsCard}>
      <Text style={styles.earningsTitle}>Today's Earnings</Text>
      <Text style={styles.earningsAmount}>{formatEarnings(driverStats?.todaysEarnings || 0)}</Text>
      <View style={styles.earningsBreakdown}>
        <View style={styles.earningsItem}>
          <Text style={styles.earningsLabel}>Deliveries</Text>
          <Text style={styles.earningsValue}>{driverStats?.completedDeliveries || 0}</Text>
        </View>
        <View style={styles.earningsItem}>
          <Text style={styles.earningsLabel}>Rating</Text>
          <Text style={styles.earningsValue}>{driverStats?.averageRating || '5.0'} ⭐</Text>
        </View>
        <View style={styles.earningsItem}>
          <Text style={styles.earningsLabel}>Time Online</Text>
          <Text style={styles.earningsValue}>{driverStats?.timeOnline || '0h 0m'}</Text>
        </View>
      </View>
    </Card>
  );

  const renderTimeSlotSelector = () => (
    <Card style={styles.timeSlotsCard}>
      <Text style={styles.sectionTitle}>Select Time Slot</Text>
      <View style={styles.timeSlotsGrid}>
        {timeSlots.map((slot) => (
          <TouchableOpacity
            key={slot.value}
            style={[
              styles.timeSlotButton,
              selectedTimeSlot === slot.value && styles.timeSlotButtonActive
            ]}
            onPress={() => setSelectedTimeSlot(slot.value)}
          >
            <Ionicons 
              name={slot.icon as any} 
              size={24} 
              color={selectedTimeSlot === slot.value ? '#fff' : '#007AFF'} 
            />
            <Text style={[
              styles.timeSlotText,
              selectedTimeSlot === slot.value && styles.timeSlotTextActive
            ]}>
              {slot.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );

  const renderActiveRoute = (route: DeliveryRoute) => {
    const colors = getRouteColorScheme(route.colorCode);
    const currentStop = route.orders.find(order => order.stopNumber === 1);
    
    return (
      <Card key={route.id} style={styles.routeCard}>
        <View style={styles.routeHeader}>
          <View style={styles.routeInfo}>
            <Text style={styles.routeTitle}>Active Route #{route.id}</Text>
            <Text style={styles.routeTimeSlot}>{route.timeSlot}</Text>
          </View>
          <Badge text="ACTIVE" variant="success" />
        </View>

        <View style={styles.routeEarnings}>
          <Text style={styles.routeEarningsTitle}>Total Earnings: {formatEarnings(route.totalEarnings)}</Text>
          <View style={styles.earningsDetails}>
            <Text style={styles.earningsDetail}>Base: {formatEarnings(route.basePay)}</Text>
            <Text style={styles.earningsDetail}>Mileage: {formatEarnings(route.mileagePay)}</Text>
            <Text style={styles.earningsDetail}>Tips: {formatEarnings(route.tips)}</Text>
          </View>
        </View>

        <View style={styles.routeStats}>
          <View style={styles.routeStat}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.routeStatText}>{route.totalDistance.toFixed(1)} mi</Text>
          </View>
          <View style={styles.routeStat}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.routeStatText}>{route.estimatedDuration} min</Text>
          </View>
          <View style={styles.routeStat}>
            <Ionicons name="bag" size={16} color="#666" />
            <Text style={styles.routeStatText}>{route.orders.length / 2} orders</Text>
          </View>
        </View>

        {currentStop && (
          <View style={styles.currentStop}>
            <Text style={styles.currentStopTitle}>Next Stop:</Text>
            <View style={styles.stopInfo}>
              <View style={[styles.stopIndicator, { backgroundColor: colors[currentStop.type] }]} />
              <View style={styles.stopDetails}>
                <Text style={styles.stopType}>
                  {currentStop.type === 'pickup' ? 'PICKUP' : 'DELIVERY'}
                </Text>
                <Text style={styles.stopAddress}>{currentStop.address}</Text>
                <Text style={styles.stopCustomer}>{currentStop.customerName}</Text>
              </View>
              <Text style={styles.stopEarnings}>{formatEarnings(currentStop.earnings)}</Text>
            </View>
          </View>
        )}

        <View style={styles.routeActions}>
          <Button
            title="Navigate"
            onPress={() => navigation.navigate('RouteNavigation', { routeId: route.id })}
            style={styles.navigateButton}
          />
          <Button
            title="Complete Stop"
            onPress={() => completeStopMutation.mutate({ 
              routeId: route.id, 
              stopIndex: currentStop?.stopNumber || 1 
            })}
            variant="outline"
            style={styles.completeButton}
          />
        </View>
      </Card>
    );
  };

  const renderAvailableRoute = (route: DeliveryRoute) => {
    const colors = getRouteColorScheme(route.colorCode);
    
    return (
      <Card key={route.id} style={styles.routeCard}>
        <View style={styles.routeHeader}>
          <View style={styles.routeInfo}>
            <Text style={styles.routeTitle}>Route #{route.id}</Text>
            <Text style={styles.routeTimeSlot}>{route.timeSlot}</Text>
          </View>
          <Badge text="AVAILABLE" variant="warning" />
        </View>

        <View style={styles.routeEarnings}>
          <Text style={styles.routeEarningsTitle}>Estimated Earnings: {formatEarnings(route.totalEarnings)}</Text>
          <View style={styles.earningsDetails}>
            <Text style={styles.earningsDetail}>Base: {formatEarnings(route.basePay)}</Text>
            <Text style={styles.earningsDetail}>Mileage: {formatEarnings(route.mileagePay)}</Text>
            <Text style={styles.earningsDetail}>Tips: {formatEarnings(route.tips)}</Text>
          </View>
        </View>

        <View style={styles.routeStats}>
          <View style={styles.routeStat}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.routeStatText}>{route.totalDistance.toFixed(1)} mi</Text>
          </View>
          <View style={styles.routeStat}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.routeStatText}>{route.estimatedDuration} min</Text>
          </View>
          <View style={styles.routeStat}>
            <Ionicons name="bag" size={16} color="#666" />
            <Text style={styles.routeStatText}>{route.orders.length / 2} orders</Text>
          </View>
        </View>

        <View style={styles.routePreview}>
          <Text style={styles.routePreviewTitle}>Route Preview:</Text>
          {route.orders.slice(0, 4).map((order, index) => (
            <View key={index} style={styles.previewStop}>
              <View style={[styles.previewIndicator, { backgroundColor: colors[order.type] }]} />
              <Text style={styles.previewText}>
                {order.type === 'pickup' ? 'Pick up' : 'Deliver to'} {order.address}
              </Text>
            </View>
          ))}
          {route.orders.length > 4 && (
            <Text style={styles.moreStops}>+{route.orders.length - 4} more stops</Text>
          )}
        </View>

        <Button
          title="Accept Route"
          onPress={() => acceptRouteMutation.mutate(route.id)}
          loading={acceptRouteMutation.isPending}
          style={styles.acceptButton}
        />
      </Card>
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Please log in to access the driver dashboard.</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Driver Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            {isOnline ? 'You are online and ready for deliveries' : 'You are offline'}
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

      {/* Earnings Card */}
      {renderEarningsCard()}

      {/* Time Slot Selector */}
      {isOnline && renderTimeSlotSelector()}

      {/* Active Routes */}
      {activeRoutes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Routes</Text>
          {activeRoutes.map(renderActiveRoute)}
        </View>
      )}

      {/* Available Routes */}
      {isOnline && selectedTimeSlot && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Routes</Text>
          {availableRoutes.length > 0 ? (
            availableRoutes.map(renderAvailableRoute)
          ) : (
            <Card style={styles.emptyCard}>
              <Ionicons name="time" size={48} color="#666" />
              <Text style={styles.emptyTitle}>No Routes Available</Text>
              <Text style={styles.emptyText}>
                New delivery routes will appear here. Check back soon!
              </Text>
            </Card>
          )}
        </View>
      )}

      {/* Offline Message */}
      {!isOnline && (
        <Card style={styles.offlineCard}>
          <Ionicons name="moon" size={48} color="#666" />
          <Text style={styles.offlineTitle}>You're Offline</Text>
          <Text style={styles.offlineText}>
            Go online to start receiving delivery routes and earning money.
          </Text>
          <Button
            title="Go Online"
            onPress={handleToggleOnline}
            style={styles.goOnlineButton}
          />
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  onlineToggleActive: {
    backgroundColor: '#e8f5e8',
  },
  onlineText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  onlineTextActive: {
    color: '#4CAF50',
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  earningsCard: {
    marginHorizontal: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  earningsTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  earningsAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
  },
  earningsBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  earningsItem: {
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  earningsValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timeSlotsCard: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlotButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: '#fff',
  },
  timeSlotButtonActive: {
    backgroundColor: '#007AFF',
  },
  timeSlotText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    flex: 1,
  },
  timeSlotTextActive: {
    color: '#fff',
  },
  routeCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  routeInfo: {
    flex: 1,
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  routeTimeSlot: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  routeEarnings: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  routeEarningsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 8,
  },
  earningsDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  earningsDetail: {
    fontSize: 12,
    color: '#666',
  },
  routeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  routeStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeStatText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  currentStop: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  currentStopTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 8,
  },
  stopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  stopDetails: {
    flex: 1,
  },
  stopType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976d2',
  },
  stopAddress: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  stopCustomer: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  stopEarnings: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  routeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  navigateButton: {
    flex: 1,
  },
  completeButton: {
    flex: 1,
  },
  routePreview: {
    marginBottom: 16,
  },
  routePreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  previewStop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  previewIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  previewText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  moreStops: {
    fontSize: 12,
    color: '#007AFF',
    fontStyle: 'italic',
    marginTop: 4,
  },
  acceptButton: {
    marginTop: 8,
  },
  emptyCard: {
    marginHorizontal: 16,
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  offlineCard: {
    marginHorizontal: 16,
    marginTop: 40,
    alignItems: 'center',
    paddingVertical: 40,
  },
  offlineTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  offlineText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  goOnlineButton: {
    minWidth: 120,
  },
});