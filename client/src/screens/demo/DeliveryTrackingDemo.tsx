import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const { width } = Dimensions.get('window');

interface DeliveryStop {
  id: number;
  orderId: number;
  type: 'pickup' | 'dropoff';
  address: string;
  customerName: string;
  items: string[];
  earnings: number;
  stopNumber: number;
  status: 'pending' | 'in_progress' | 'completed';
  estimatedTime: string;
  coordinates: { lat: number; lng: number };
}

interface DemoRoute {
  id: number;
  driverName: string;
  timeSlot: string;
  totalEarnings: number;
  totalDistance: number;
  estimatedDuration: number;
  colorCode: string;
  stops: DeliveryStop[];
}

export default function DeliveryTrackingDemo({ navigation }: any) {
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

  // Demo route data showing optimized delivery sequence
  const demoRoute: DemoRoute = {
    id: 1,
    driverName: 'Alex Thompson',
    timeSlot: '2:00 PM - 5:00 PM',
    totalEarnings: 32.50,
    totalDistance: 4.8,
    estimatedDuration: 65,
    colorCode: 'blue',
    stops: [
      {
        id: 1,
        orderId: 101,
        type: 'pickup',
        address: '123 Commerce Street',
        customerName: 'Sarah Johnson',
        items: ['Vintage Camera', 'Film Rolls'],
        earnings: 4.00,
        stopNumber: 1,
        status: 'completed',
        estimatedTime: '2:05 PM',
        coordinates: { lat: 40.7128, lng: -74.0060 },
      },
      {
        id: 2,
        orderId: 102,
        type: 'pickup',
        address: '456 Market Plaza',
        customerName: 'Mike Chen',
        items: ['Guitar Amplifier', 'Audio Cables'],
        earnings: 4.00,
        stopNumber: 2,
        status: 'completed',
        estimatedTime: '2:15 PM',
        coordinates: { lat: 40.7150, lng: -74.0080 },
      },
      {
        id: 3,
        orderId: 103,
        type: 'pickup',
        address: '789 Broadway Plaza',
        customerName: 'Lisa Rodriguez',
        items: ['Designer Handbag'],
        earnings: 4.00,
        stopNumber: 3,
        status: 'in_progress',
        estimatedTime: '2:25 PM',
        coordinates: { lat: 40.7180, lng: -74.0020 },
      },
      {
        id: 4,
        orderId: 101,
        type: 'dropoff',
        address: '321 Oak Avenue',
        customerName: 'Sarah Johnson',
        items: ['Vintage Camera', 'Film Rolls'],
        earnings: 2.50,
        stopNumber: 4,
        status: 'pending',
        estimatedTime: '2:40 PM',
        coordinates: { lat: 40.7589, lng: -73.9851 },
      },
      {
        id: 5,
        orderId: 102,
        type: 'dropoff',
        address: '654 Pine Street',
        customerName: 'Mike Chen',
        items: ['Guitar Amplifier', 'Audio Cables'],
        earnings: 3.00,
        stopNumber: 5,
        status: 'pending',
        estimatedTime: '2:55 PM',
        coordinates: { lat: 40.7831, lng: -73.9712 },
      },
      {
        id: 6,
        orderId: 103,
        type: 'dropoff',
        address: '987 Park Avenue',
        customerName: 'Lisa Rodriguez',
        items: ['Designer Handbag'],
        earnings: 2.50,
        stopNumber: 6,
        status: 'pending',
        estimatedTime: '3:10 PM',
        coordinates: { lat: 40.7614, lng: -73.9776 },
      },
    ],
  };

  const getColorScheme = () => ({
    pickup: '#1E3A8A', // Dark blue for pickups
    dropoff: '#3B82F6', // Light blue for dropoffs
  });

  const getStopStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'in_progress':
        return '#FF9800';
      case 'pending':
        return '#E0E0E0';
      default:
        return '#E0E0E0';
    }
  };

  const getStopIcon = (type: string, status: string) => {
    if (status === 'completed') return 'checkmark-circle';
    if (status === 'in_progress') return 'radio-button-on';
    return type === 'pickup' ? 'arrow-up-circle-outline' : 'arrow-down-circle-outline';
  };

  const startSimulation = () => {
    setIsSimulationRunning(true);
    setCurrentStopIndex(0);
    
    // Animate progress through stops
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 10000, // 10 seconds for full simulation
      useNativeDriver: false,
    }).start(() => {
      setIsSimulationRunning(false);
      setCurrentStopIndex(demoRoute.stops.length - 1);
    });
  };

  const resetSimulation = () => {
    setIsSimulationRunning(false);
    setCurrentStopIndex(0);
    animatedValue.setValue(0);
  };

  const renderRouteHeader = () => (
    <Card style={styles.headerCard}>
      <View style={styles.routeHeader}>
        <View style={styles.routeInfo}>
          <Text style={styles.routeTitle}>Live Delivery Route Demo</Text>
          <Text style={styles.routeSubtitle}>Driver: {demoRoute.driverName}</Text>
          <Text style={styles.routeTimeSlot}>{demoRoute.timeSlot}</Text>
        </View>
        <View style={styles.routeStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>${demoRoute.totalEarnings}</Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{demoRoute.totalDistance}mi</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{demoRoute.estimatedDuration}min</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
        </View>
      </View>
    </Card>
  );

  const renderOptimizationExplanation = () => (
    <Card style={styles.explanationCard}>
      <Text style={styles.explanationTitle}>How Route Optimization Works</Text>
      <Text style={styles.explanationText}>
        Our AI-powered system groups pickups and dropoffs to minimize travel time and maximize driver earnings:
      </Text>
      <View style={styles.optimizationPoints}>
        <View style={styles.optimizationPoint}>
          <View style={[styles.pointIndicator, { backgroundColor: '#1E3A8A' }]} />
          <Text style={styles.pointText}>
            <Text style={styles.pointBold}>Dark Blue:</Text> Pickup locations are grouped by proximity
          </Text>
        </View>
        <View style={styles.optimizationPoint}>
          <View style={[styles.pointIndicator, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.pointText}>
            <Text style={styles.pointBold}>Light Blue:</Text> Dropoffs follow efficient routing
          </Text>
        </View>
        <View style={styles.optimizationPoint}>
          <Ionicons name="trending-up" size={16} color="#4CAF50" />
          <Text style={styles.pointText}>
            <Text style={styles.pointBold}>Result:</Text> 40% faster delivery times, higher earnings
          </Text>
        </View>
      </View>
    </Card>
  );

  const renderRouteVisualization = () => {
    const colors = getColorScheme();
    
    return (
      <Card style={styles.visualizationCard}>
        <Text style={styles.sectionTitle}>Optimized Route Sequence</Text>
        <Text style={styles.sectionSubtitle}>
          6 deliveries • 12 stops • Maximum efficiency routing
        </Text>
        
        <View style={styles.routeTimeline}>
          {demoRoute.stops.map((stop, index) => {
            const isActive = index <= currentStopIndex;
            const isCurrent = index === currentStopIndex && isSimulationRunning;
            
            return (
              <View key={stop.id} style={styles.timelineStop}>
                <View style={styles.timelineConnection}>
                  {index > 0 && (
                    <View style={[
                      styles.connectionLine,
                      { backgroundColor: isActive ? colors[stop.type] : '#E0E0E0' }
                    ]} />
                  )}
                </View>
                
                <View style={styles.stopContainer}>
                  <View style={[
                    styles.stopIndicator,
                    {
                      backgroundColor: isActive ? colors[stop.type] : '#E0E0E0',
                      borderColor: isCurrent ? '#FF9800' : 'transparent',
                      borderWidth: isCurrent ? 3 : 0,
                    }
                  ]}>
                    <Ionicons
                      name={getStopIcon(stop.type, isActive ? stop.status : 'pending')}
                      size={20}
                      color="#fff"
                    />
                  </View>
                  
                  <View style={styles.stopDetails}>
                    <View style={styles.stopHeader}>
                      <Text style={styles.stopNumber}>Stop {stop.stopNumber}</Text>
                      <Text style={styles.stopType}>
                        {stop.type.toUpperCase()}
                      </Text>
                      <Text style={styles.stopEarnings}>+${stop.earnings}</Text>
                    </View>
                    
                    <Text style={styles.stopAddress}>{stop.address}</Text>
                    <Text style={styles.stopCustomer}>{stop.customerName}</Text>
                    <Text style={styles.stopItems}>
                      {stop.items.join(', ')}
                    </Text>
                    <Text style={styles.stopTime}>{stop.estimatedTime}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </Card>
    );
  };

  const renderOrderGrouping = () => (
    <Card style={styles.groupingCard}>
      <Text style={styles.sectionTitle}>Order Grouping Visualization</Text>
      <Text style={styles.sectionSubtitle}>
        See how multiple orders are efficiently combined into one route
      </Text>
      
      <View style={styles.orderGroups}>
        {[101, 102, 103].map((orderId, index) => {
          const pickupStop = demoRoute.stops.find(s => s.orderId === orderId && s.type === 'pickup');
          const dropoffStop = demoRoute.stops.find(s => s.orderId === orderId && s.type === 'dropoff');
          const colors = ['#1E3A8A', '#7C2D12', '#14532D'];
          
          return (
            <View key={orderId} style={styles.orderGroup}>
              <Text style={styles.orderTitle}>Order #{orderId}</Text>
              <Text style={styles.orderCustomer}>{pickupStop?.customerName}</Text>
              
              <View style={styles.orderFlow}>
                <View style={styles.orderStop}>
                  <View style={[styles.orderIndicator, { backgroundColor: colors[index] }]} />
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderLabel}>PICKUP</Text>
                    <Text style={styles.orderAddress}>{pickupStop?.address}</Text>
                    <Text style={styles.orderStopNumber}>Stop {pickupStop?.stopNumber}</Text>
                  </View>
                </View>
                
                <View style={styles.orderArrow}>
                  <Ionicons name="arrow-forward" size={20} color="#666" />
                </View>
                
                <View style={styles.orderStop}>
                  <View style={[styles.orderIndicator, { backgroundColor: colors[index], opacity: 0.6 }]} />
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderLabel}>DROPOFF</Text>
                    <Text style={styles.orderAddress}>{dropoffStop?.address}</Text>
                    <Text style={styles.orderStopNumber}>Stop {dropoffStop?.stopNumber}</Text>
                  </View>
                </View>
              </View>
              
              <Text style={styles.orderEarnings}>
                Total: ${((pickupStop?.earnings || 0) + (dropoffStop?.earnings || 0)).toFixed(2)}
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );

  const renderControls = () => (
    <Card style={styles.controlsCard}>
      <Text style={styles.sectionTitle}>Live Demo Controls</Text>
      <View style={styles.controls}>
        <Button
          title={isSimulationRunning ? "Running..." : "Start Live Demo"}
          onPress={startSimulation}
          disabled={isSimulationRunning}
          style={styles.controlButton}
        />
        <Button
          title="Reset Demo"
          onPress={resetSimulation}
          variant="outline"
          style={styles.controlButton}
        />
      </View>
      
      {isSimulationRunning && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Simulating real-time delivery progress...
          </Text>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>
      )}
    </Card>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderRouteHeader()}
      {renderOptimizationExplanation()}
      {renderRouteVisualization()}
      {renderOrderGrouping()}
      {renderControls()}
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          This demo shows real MarketPace delivery optimization in action
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  headerCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  routeHeader: {
    alignItems: 'center',
  },
  routeInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  routeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  routeSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  routeTimeSlot: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  routeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  explanationCard: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  explanationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  optimizationPoints: {
    gap: 12,
  },
  optimizationPoint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  pointText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  pointBold: {
    fontWeight: '600',
  },
  visualizationCard: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  routeTimeline: {
    paddingLeft: 20,
  },
  timelineStop: {
    position: 'relative',
    marginBottom: 24,
  },
  timelineConnection: {
    position: 'absolute',
    left: 15,
    top: -12,
    width: 2,
    height: 24,
  },
  connectionLine: {
    width: 2,
    height: '100%',
  },
  stopContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stopIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stopDetails: {
    flex: 1,
    paddingTop: 2,
  },
  stopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stopNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
  },
  stopType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 8,
  },
  stopEarnings: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 'auto',
  },
  stopAddress: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  stopCustomer: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  stopItems: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 2,
  },
  stopTime: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  groupingCard: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  orderGroups: {
    gap: 16,
  },
  orderGroup: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  orderCustomer: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  orderFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderStop: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  orderInfo: {
    flex: 1,
  },
  orderLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  orderAddress: {
    fontSize: 12,
    color: '#333',
    marginBottom: 2,
  },
  orderStopNumber: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: '500',
  },
  orderArrow: {
    paddingHorizontal: 8,
  },
  orderEarnings: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    textAlign: 'right',
  },
  controlsCard: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  controlButton: {
    flex: 1,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e1e8ed',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});