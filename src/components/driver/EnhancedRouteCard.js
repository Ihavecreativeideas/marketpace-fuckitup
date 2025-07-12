import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils/colors';

export default function EnhancedRouteCard({ 
  route, 
  onAccept, 
  onViewDetails, 
  onMessageCustomer,
  canStartPickup,
  estimatedTime,
  isNearby = false,
  distance,
  isCurrent = false,
  onContinue
}) {
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatTimeSlot = (timeSlot) => {
    const slots = {
      'morning': '9AM-12PM',
      'afternoon': '12PM-3PM', 
      'evening': '3PM-6PM',
      'night': '6PM-9PM'
    };
    return slots[timeSlot] || timeSlot;
  };

  const canAcceptRoute = () => {
    const now = new Date();
    const routeStart = new Date(route.startTime);
    const acceptDeadline = new Date(routeStart.getTime() - 20 * 60 * 1000); // 20 minutes before
    
    return now < acceptDeadline;
  };

  const getRouteStatus = () => {
    if (isCurrent) return 'current';
    if (!canAcceptRoute()) return 'closed';
    if (canStartPickup) return 'ready';
    return 'available';
  };

  const getStatusColor = () => {
    switch (getRouteStatus()) {
      case 'current': return colors.info;
      case 'ready': return colors.success;
      case 'closed': return colors.error;
      default: return colors.primary;
    }
  };

  const getStatusText = () => {
    switch (getRouteStatus()) {
      case 'current': return 'In Progress';
      case 'ready': return 'Ready to Start';
      case 'closed': return 'Closed';
      default: return 'Available';
    }
  };

  return (
    <View style={[styles.card, { borderLeftColor: getStatusColor() }]}>
      <View style={styles.header}>
        <View style={styles.routeInfo}>
          <Text style={styles.routeTitle}>
            Route #{route.id} {isNearby && '(Nearby)'}
          </Text>
          <Text style={styles.timeSlot}>
            {formatTimeSlot(route.timeSlot)}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="location" size={16} color={colors.gray} />
          <Text style={styles.detailText}>
            {route.pickups} pickup{route.pickups > 1 ? 's' : ''}, {route.dropoffs} drop{route.dropoffs > 1 ? 's' : ''}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="car" size={16} color={colors.gray} />
          <Text style={styles.detailText}>
            {route.mileage} miles • Est. {formatTime(estimatedTime)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="wallet" size={16} color={colors.gray} />
          <Text style={styles.detailText}>
            Earnings: ${route.earnings.toFixed(2)}
          </Text>
        </View>

        {isNearby && distance && (
          <View style={styles.detailRow}>
            <Ionicons name="navigate" size={16} color={colors.info} />
            <Text style={[styles.detailText, { color: colors.info }]}>
              {distance.toFixed(1)} miles from you
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onViewDetails}
        >
          <Text style={styles.secondaryButtonText}>View Details</Text>
        </TouchableOpacity>

        {isCurrent ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onContinue}
          >
            <Text style={styles.primaryButtonText}>Continue Route</Text>
          </TouchableOpacity>
        ) : canAcceptRoute() ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onAccept}
          >
            <Text style={styles.primaryButtonText}>Accept Route</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.disabledButton}
            disabled
          >
            <Text style={styles.disabledButtonText}>Closed</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Customer messaging for nearby routes */}
      {isNearby && route.customers && route.customers.length > 0 && (
        <View style={styles.customerSection}>
          <Text style={styles.customerSectionTitle}>Message customers about earlier delivery:</Text>
          {route.customers.map(customer => (
            <TouchableOpacity
              key={customer.id}
              style={styles.customerButton}
              onPress={() => onMessageCustomer(customer)}
            >
              <Ionicons name="chatbubble" size={16} color={colors.primary} />
              <Text style={styles.customerButtonText}>
                Message {customer.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeInfo: {
    flex: 1,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  timeSlot: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '600',
  },
  details: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
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
  secondaryButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  disabledButtonText: {
    color: colors.gray,
    fontSize: 14,
    fontWeight: '600',
  },
  customerSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  customerSectionTitle: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 8,
  },
  customerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  customerButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
});