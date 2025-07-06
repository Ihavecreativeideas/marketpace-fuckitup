import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DeliveryRoute {
  id: string;
  timeSlot: string;
  status: 'available' | 'accepted' | 'in-progress' | 'completed';
  stopCount: number;
  estimatedEarnings: number;
  estimatedDuration: string;
  pickupStops: number;
  dropoffStops: number;
}

interface ActiveDelivery {
  id: string;
  type: 'pickup' | 'dropoff';
  customer: string;
  address: string;
  items: string[];
  color: 'blue' | 'red';
  status: 'pending' | 'completed';
}

export default function Deliveries() {
  const [userType, setUserType] = useState<'driver' | 'customer'>('customer');
  const [activeTab, setActiveTab] = useState('available');

  // Mock delivery routes for drivers
  const availableRoutes: DeliveryRoute[] = [
    {
      id: '1',
      timeSlot: '12pm-3pm',
      status: 'available',
      stopCount: 10,
      estimatedEarnings: 42,
      estimatedDuration: '2.5 hours',
      pickupStops: 5,
      dropoffStops: 5,
    },
    {
      id: '2',
      timeSlot: '3pm-6pm',
      status: 'available',
      stopCount: 12,
      estimatedEarnings: 54,
      estimatedDuration: '3 hours',
      pickupStops: 6,
      dropoffStops: 6,
    },
  ];

  // Mock active deliveries
  const activeDeliveries: ActiveDelivery[] = [
    {
      id: '1',
      type: 'pickup',
      customer: 'Sarah\'s Bakery',
      address: '123 Main St',
      items: ['Fresh bread order', 'Custom cake'],
      color: 'blue',
      status: 'pending',
    },
    {
      id: '2',
      type: 'dropoff',
      customer: 'Mike Johnson',
      address: '456 Oak Ave',
      items: ['Fresh bread order'],
      color: 'blue',
      status: 'pending',
    },
  ];

  const getColorForStop = (color: 'blue' | 'red', type: 'pickup' | 'dropoff') => {
    if (color === 'blue') {
      return type === 'pickup' ? '#1E3A8A' : '#3B82F6'; // Dark blue to light blue
    } else {
      return type === 'pickup' ? '#991B1B' : '#EF4444'; // Dark red to light red
    }
  };

  const renderRouteCard = ({ item }: { item: DeliveryRoute }) => (
    <View style={styles.routeCard}>
      <View style={styles.routeHeader}>
        <View style={styles.timeSlotContainer}>
          <Ionicons name="time" size={20} color="#6B46C1" />
          <Text style={styles.timeSlot}>{item.timeSlot}</Text>
        </View>
        <Text style={styles.earnings}>${item.estimatedEarnings}</Text>
      </View>
      
      <View style={styles.routeDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="location" size={16} color="#8E8E93" />
          <Text style={styles.detailText}>{item.stopCount} stops</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color="#8E8E93" />
          <Text style={styles.detailText}>{item.estimatedDuration}</Text>
        </View>
      </View>

      <View style={styles.stopBreakdown}>
        <View style={styles.stopType}>
          <View style={[styles.stopIndicator, { backgroundColor: '#1E3A8A' }]} />
          <Text style={styles.stopText}>{item.pickupStops} pickups ($4 each)</Text>
        </View>
        <View style={styles.stopType}>
          <View style={[styles.stopIndicator, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.stopText}>{item.dropoffStops} drop-offs ($2 each)</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.acceptButton}>
        <Text style={styles.acceptButtonText}>Accept Route</Text>
      </TouchableOpacity>
    </View>
  );

  const renderActiveDelivery = ({ item }: { item: ActiveDelivery }) => (
    <View style={styles.deliveryCard}>
      <View style={styles.deliveryHeader}>
        <View style={[
          styles.deliveryTypeIndicator, 
          { backgroundColor: getColorForStop(item.color, item.type) }
        ]}>
          <Ionicons 
            name={item.type === 'pickup' ? 'arrow-up' : 'arrow-down'} 
            size={16} 
            color="white" 
          />
          <Text style={styles.deliveryTypeText}>
            {item.type === 'pickup' ? 'PICKUP' : 'DROPOFF'}
          </Text>
        </View>
        <Text style={styles.deliveryStatus}>
          {item.status === 'pending' ? 'In Progress' : 'Completed'}
        </Text>
      </View>

      <Text style={styles.customerName}>{item.customer}</Text>
      <Text style={styles.address}>{item.address}</Text>
      
      <View style={styles.itemsList}>
        {item.items.map((itemName, index) => (
          <Text key={index} style={styles.itemText}>• {itemName}</Text>
        ))}
      </View>

      <TouchableOpacity style={styles.completeButton}>
        <Text style={styles.completeButtonText}>
          {item.type === 'pickup' ? 'Confirm Pickup' : 'Confirm Delivery'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const tabs = [
    { id: 'available', label: 'Available Routes', icon: 'list' },
    { id: 'active', label: 'Active Route', icon: 'car' },
    { id: 'earnings', label: 'Earnings', icon: 'cash' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Deliveries</Text>
        <Text style={styles.headerSubtitle}>
          {userType === 'driver' 
            ? 'Supporting your community, one delivery at a time' 
            : 'Track your community deliveries'
          }
        </Text>
      </View>

      {/* User Type Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            userType === 'customer' && styles.activeToggle,
          ]}
          onPress={() => setUserType('customer')}
        >
          <Text style={[
            styles.toggleText,
            userType === 'customer' && styles.activeToggleText,
          ]}>
            My Orders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            userType === 'driver' && styles.activeToggle,
          ]}
          onPress={() => setUserType('driver')}
        >
          <Text style={[
            styles.toggleText,
            userType === 'driver' && styles.activeToggleText,
          ]}>
            Driver Dashboard
          </Text>
        </TouchableOpacity>
      </View>

      {userType === 'driver' && (
        <>
          {/* Driver Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>$127</Text>
              <Text style={styles.statLabel}>Today's Earnings</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>23</Text>
              <Text style={styles.statLabel}>Deliveries</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>4.9</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>

          {/* Tab Navigation */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.tabContainer}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  activeTab === tab.id && styles.activeTab,
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={16}
                  color={activeTab === tab.id ? '#6B46C1' : '#8E8E93'}
                />
                <Text style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText,
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Content based on active tab */}
          {activeTab === 'available' && (
            <FlatList
              data={availableRoutes}
              renderItem={renderRouteCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          )}

          {activeTab === 'active' && (
            <FlatList
              data={activeDeliveries}
              renderItem={renderActiveDelivery}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </>
      )}

      {userType === 'customer' && (
        <View style={styles.customerView}>
          <View style={styles.noOrdersContainer}>
            <Ionicons name="package-outline" size={64} color="#C4B5FD" />
            <Text style={styles.noOrdersTitle}>No Active Deliveries</Text>
            <Text style={styles.noOrdersSubtitle}>
              When you place an order, you'll see delivery tracking here
            </Text>
            <TouchableOpacity style={styles.browseButton}>
              <Text style={styles.browseButtonText}>Browse Marketplace</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeToggle: {
    backgroundColor: '#6B46C1',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  activeToggleText: {
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B46C1',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  tabContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  activeTab: {
    backgroundColor: '#E0E7FF',
  },
  tabText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 6,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#6B46C1',
  },
  listContainer: {
    paddingBottom: 100,
  },
  routeCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  timeSlotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeSlot: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  earnings: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  routeDetails: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  detailText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
  stopBreakdown: {
    marginBottom: 15,
  },
  stopType: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stopIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  stopText: {
    fontSize: 14,
    color: '#1C1C1E',
  },
  acceptButton: {
    backgroundColor: '#6B46C1',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  deliveryCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  deliveryTypeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  deliveryTypeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 4,
  },
  deliveryStatus: {
    fontSize: 14,
    color: '#8E8E93',
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  itemsList: {
    marginBottom: 15,
  },
  itemText: {
    fontSize: 14,
    color: '#1C1C1E',
    marginBottom: 4,
  },
  completeButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  customerView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noOrdersContainer: {
    alignItems: 'center',
  },
  noOrdersTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 20,
    marginBottom: 8,
  },
  noOrdersSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  browseButton: {
    backgroundColor: '#6B46C1',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});