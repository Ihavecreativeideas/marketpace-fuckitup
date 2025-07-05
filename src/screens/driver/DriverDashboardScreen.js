import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/common/Header';
import RouteCard from '../../components/driver/RouteCard';
import { colors } from '../../utils/colors';
import { api } from '../../services/api';

export default function DriverDashboardScreen({ navigation }) {
  const [driverStatus, setDriverStatus] = useState('offline'); // offline, online, busy
  const [currentRoute, setCurrentRoute] = useState(null);
  const [availableRoutes, setAvailableRoutes] = useState([]);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [weeklyEarnings, setWeeklyEarnings] = useState(0);
  const [completedDeliveries, setCompletedDeliveries] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [routesResponse, statsResponse] = await Promise.all([
        api.get('/drivers/routes/available'),
        api.get('/drivers/stats')
      ]);

      setAvailableRoutes(routesResponse.data.routes);
      setCurrentRoute(routesResponse.data.currentRoute);
      setTodayEarnings(statsResponse.data.todayEarnings);
      setWeeklyEarnings(statsResponse.data.weeklyEarnings);
      setCompletedDeliveries(statsResponse.data.completedDeliveries);
      setDriverStatus(statsResponse.data.status);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const toggleDriverStatus = async () => {
    try {
      const newStatus = driverStatus === 'offline' ? 'online' : 'offline';
      await api.post('/drivers/status', { status: newStatus });
      setDriverStatus(newStatus);
      
      if (newStatus === 'offline') {
        Alert.alert('Going Offline', 'You are now offline and will not receive new delivery requests.');
      } else {
        Alert.alert('Going Online', 'You are now online and available for deliveries!');
      }
    } catch (error) {
      console.error('Error updating driver status:', error);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const acceptRoute = async (routeId) => {
    try {
      await api.post(`/drivers/routes/${routeId}/accept`);
      Alert.alert('Route Accepted', 'You have accepted this delivery route!');
      loadDashboardData();
      navigation.navigate('Route', { routeId });
    } catch (error) {
      console.error('Error accepting route:', error);
      Alert.alert('Error', 'Failed to accept route');
    }
  };

  const renderRouteCard = ({ item }) => (
    <RouteCard
      route={item}
      onAccept={() => acceptRoute(item.id)}
      onViewDetails={() => navigation.navigate('RouteDetails', { routeId: item.id })}
    />
  );

  const getStatusColor = () => {
    switch (driverStatus) {
      case 'online': return colors.success;
      case 'busy': return colors.warning;
      default: return colors.gray;
    }
  };

  const getStatusText = () => {
    switch (driverStatus) {
      case 'online': return 'Online';
      case 'busy': return 'Busy';
      default: return 'Offline';
    }
  };

  if (!user?.isDriver) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Driver Dashboard" />
        <View style={styles.notDriverContainer}>
          <Ionicons name="car-outline" size={64} color={colors.gray} />
          <Text style={styles.notDriverTitle}>Not a Driver</Text>
          <Text style={styles.notDriverText}>
            You need to apply and be approved as a driver to access this dashboard.
          </Text>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => navigation.navigate('DriverApplication')}
          >
            <Text style={styles.applyButtonText}>Apply to be a Driver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Driver Dashboard"
        rightComponent={
          <TouchableOpacity
            style={[styles.statusButton, { backgroundColor: getStatusColor() }]}
            onPress={toggleDriverStatus}
          >
            <Text style={styles.statusButtonText}>{getStatusText()}</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Current Route */}
        {currentRoute && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Route</Text>
            <RouteCard
              route={currentRoute}
              isCurrent={true}
              onContinue={() => navigation.navigate('Route', { routeId: currentRoute.id })}
            />
          </View>
        )}

        {/* Earnings Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earnings</Text>
          <View style={styles.earningsContainer}>
            <View style={styles.earningsCard}>
              <Text style={styles.earningsLabel}>Today</Text>
              <Text style={styles.earningsValue}>${todayEarnings.toFixed(2)}</Text>
            </View>
            <View style={styles.earningsCard}>
              <Text style={styles.earningsLabel}>This Week</Text>
              <Text style={styles.earningsValue}>${weeklyEarnings.toFixed(2)}</Text>
            </View>
            <View style={styles.earningsCard}>
              <Text style={styles.earningsLabel}>Deliveries</Text>
              <Text style={styles.earningsValue}>{completedDeliveries}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('EarningsHistory')}
            >
              <Ionicons name="wallet" size={24} color={colors.primary} />
              <Text style={styles.quickActionText}>Earnings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('DeliveryHistory')}
            >
              <Ionicons name="list" size={24} color={colors.success} />
              <Text style={styles.quickActionText}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('DriverSupport')}
            >
              <Ionicons name="help-circle" size={24} color={colors.info} />
              <Text style={styles.quickActionText}>Support</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('DriverSettings')}
            >
              <Ionicons name="settings" size={24} color={colors.gray} />
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Available Routes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Routes</Text>
            <TouchableOpacity onPress={loadDashboardData}>
              <Ionicons name="refresh" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          {driverStatus === 'offline' ? (
            <View style={styles.offlineMessage}>
              <Ionicons name="information-circle" size={24} color={colors.warning} />
              <Text style={styles.offlineMessageText}>
                Go online to see available delivery routes
              </Text>
            </View>
          ) : availableRoutes.length === 0 ? (
            <View style={styles.noRoutesContainer}>
              <Ionicons name="car-outline" size={48} color={colors.gray} />
              <Text style={styles.noRoutesText}>No available routes</Text>
              <Text style={styles.noRoutesSubtext}>
                New delivery routes will appear here when available
              </Text>
            </View>
          ) : (
            <FlatList
              data={availableRoutes}
              renderItem={renderRouteCard}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Driver Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver Tips</Text>
          <View style={styles.tipCard}>
            <Ionicons name="bulb" size={24} color={colors.warning} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Maximize Your Earnings</Text>
              <Text style={styles.tipText}>
                Accept routes with multiple stops and stay in busy areas during peak hours (11AM-2PM, 5PM-8PM)
              </Text>
            </View>
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
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  notDriverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  notDriverTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  notDriverText: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  applyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: colors.white,
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  earningsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  earningsCard: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 4,
  },
  earningsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  quickActionText: {
    fontSize: 12,
    color: colors.text,
    marginTop: 8,
    fontWeight: '500',
  },
  offlineMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    padding: 16,
    borderRadius: 8,
  },
  offlineMessageText: {
    fontSize: 14,
    color: colors.warning,
    marginLeft: 8,
    fontWeight: '500',
  },
  noRoutesContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noRoutesText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
  },
  noRoutesSubtext: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    marginTop: 4,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: colors.gray,
    lineHeight: 20,
  },
});
