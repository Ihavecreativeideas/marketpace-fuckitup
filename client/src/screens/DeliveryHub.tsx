import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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

export default function DeliveryHub({ navigation }: any) {
  const [activeTab, setActiveTab] = useState('demo');
  const { user } = useAuth();

  const { data: driverApplication } = useQuery({
    queryKey: ['/api/driver-application'],
    queryFn: () => apiRequest('GET', '/api/driver-application'),
    enabled: !!user,
  });

  const isApprovedDriver = driverApplication?.status === 'approved';
  const hasDriverApplication = !!driverApplication;

  const tabs = [
    { id: 'demo', name: 'Route Demo', icon: 'map' },
    { id: 'driver', name: 'Driver Hub', icon: 'car' },
    { id: 'track', name: 'Track Orders', icon: 'location' },
  ];

  const renderTabBar = () => (
    <Card style={styles.tabBar}>
      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={20} 
              color={activeTab === tab.id ? '#007AFF' : '#666'} 
            />
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );

  const renderDeliveryDemo = () => (
    <View style={styles.tabContent}>
      <Card style={styles.demoCard}>
        <View style={styles.demoHeader}>
          <Ionicons name="map" size={48} color="#007AFF" />
          <Text style={styles.demoTitle}>Live Delivery Optimization Demo</Text>
          <Text style={styles.demoDescription}>
            See how MarketPace optimizes delivery routes to maximize efficiency and earnings
          </Text>
        </View>

        <View style={styles.demoFeatures}>
          <View style={styles.demoFeature}>
            <View style={[styles.featureIcon, { backgroundColor: '#1E3A8A' }]}>
              <Ionicons name="arrow-up-circle" size={20} color="#fff" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Smart Pickup Grouping</Text>
              <Text style={styles.featureDescription}>
                Dark blue stops show pickup locations grouped by proximity
              </Text>
            </View>
          </View>

          <View style={styles.demoFeature}>
            <View style={[styles.featureIcon, { backgroundColor: '#3B82F6' }]}>
              <Ionicons name="arrow-down-circle" size={20} color="#fff" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Optimized Dropoffs</Text>
              <Text style={styles.featureDescription}>
                Light blue stops show efficient delivery routing
              </Text>
            </View>
          </View>

          <View style={styles.demoFeature}>
            <View style={[styles.featureIcon, { backgroundColor: '#4CAF50' }]}>
              <Ionicons name="trending-up" size={20} color="#fff" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Maximum Efficiency</Text>
              <Text style={styles.featureDescription}>
                Up to 6 deliveries per route with 40% faster completion
              </Text>
            </View>
          </View>
        </View>

        <Button
          title="View Live Route Demo"
          onPress={() => navigation.navigate('DeliveryTrackingDemo')}
          style={styles.demoButton}
        />
      </Card>

      <Card style={styles.statsCard}>
        <Text style={styles.statsTitle}>Demo Route Performance</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>6</Text>
            <Text style={styles.statLabel}>Deliveries</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Total Stops</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>$32.50</Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4.8mi</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
        </View>
      </Card>
    </View>
  );

  const renderDriverHub = () => (
    <View style={styles.tabContent}>
      {!hasDriverApplication ? (
        <Card style={styles.applicationCard}>
          <Ionicons name="car" size={48} color="#007AFF" />
          <Text style={styles.applicationTitle}>Become a MarketPace Driver</Text>
          <Text style={styles.applicationDescription}>
            Join our delivery network and start earning money on your schedule. 
            Quick approval process with immediate hiring for qualified drivers.
          </Text>
          
          <View style={styles.requirementsList}>
            <View style={styles.requirement}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.requirementText}>Valid driver's license</Text>
            </View>
            <View style={styles.requirement}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.requirementText}>Current auto insurance</Text>
            </View>
            <View style={styles.requirement}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.requirementText}>Background check (Uber Eats standards)</Text>
            </View>
            <View style={styles.requirement}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.requirementText}>Bank account for instant payments</Text>
            </View>
          </View>

          <Button
            title="Apply to Drive"
            onPress={() => navigation.navigate('EnhancedDriverApplication')}
            style={styles.applyButton}
          />
        </Card>
      ) : !isApprovedDriver ? (
        <Card style={styles.statusCard}>
          <Ionicons name="time" size={48} color="#FF9800" />
          <Text style={styles.statusTitle}>Application Under Review</Text>
          <Text style={styles.statusDescription}>
            Your driver application is being processed. This typically takes just a few minutes.
          </Text>
          <Badge text={driverApplication.status} variant="warning" />
        </Card>
      ) : (
        <Card style={styles.dashboardCard}>
          <View style={styles.dashboardHeader}>
            <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
            <Text style={styles.dashboardTitle}>Welcome to the Driver Network!</Text>
            <Text style={styles.dashboardDescription}>
              You're approved and ready to start earning. Access your driver dashboard to begin.
            </Text>
          </View>

          <Button
            title="Open Driver Dashboard"
            onPress={() => navigation.navigate('UberEatsStyleDashboard')}
            style={styles.dashboardButton}
          />
        </Card>
      )}
    </View>
  );

  const renderOrderTracking = () => (
    <View style={styles.tabContent}>
      <Card style={styles.trackingCard}>
        <Ionicons name="location" size={48} color="#007AFF" />
        <Text style={styles.trackingTitle}>Order Tracking</Text>
        <Text style={styles.trackingDescription}>
          Track your orders in real-time with our color-coded delivery system
        </Text>

        <View style={styles.trackingFeatures}>
          <View style={styles.trackingFeature}>
            <View style={[styles.trackingIcon, { backgroundColor: '#1E3A8A' }]} />
            <Text style={styles.trackingText}>Dark Blue: Item pickup in progress</Text>
          </View>
          <View style={styles.trackingFeature}>
            <View style={[styles.trackingIcon, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.trackingText}>Light Blue: Out for delivery to you</Text>
          </View>
          <View style={styles.trackingFeature}>
            <View style={[styles.trackingIcon, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.trackingText}>Green: Delivered successfully</Text>
          </View>
        </View>

        <Button
          title="View My Orders"
          onPress={() => navigation.navigate('OrderHistory')}
          variant="outline"
          style={styles.trackingButton}
        />
      </Card>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'demo':
        return renderDeliveryDemo();
      case 'driver':
        return renderDriverHub();
      case 'track':
        return renderOrderTracking();
      default:
        return renderDeliveryDemo();
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderTabBar()}
      {renderTabContent()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  tabBar: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#e3f2fd',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabContent: {
    paddingHorizontal: 16,
  },
  demoCard: {
    marginBottom: 16,
    alignItems: 'center',
  },
  demoHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  demoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  demoDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  demoFeatures: {
    width: '100%',
    marginBottom: 24,
  },
  demoFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  demoButton: {
    width: '100%',
  },
  statsCard: {
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  applicationCard: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  applicationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  applicationDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 22,
  },
  requirementsList: {
    width: '100%',
    marginBottom: 24,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  applyButton: {
    width: '100%',
  },
  statusCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  statusDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 22,
  },
  dashboardCard: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  dashboardHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  dashboardDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  dashboardButton: {
    width: '100%',
  },
  trackingCard: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  trackingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  trackingDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 22,
  },
  trackingFeatures: {
    width: '100%',
    marginBottom: 24,
  },
  trackingFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  trackingIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  trackingText: {
    fontSize: 14,
    color: '#333',
  },
  trackingButton: {
    width: '100%',
  },
});