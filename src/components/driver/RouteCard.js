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

export default function RouteCard({
  route,
  onAccept,
  onViewDetails,
  onContinue,
  isCurrent = false,
  style,
}) {
  const handleAccept = () => {
    Alert.alert(
      'Accept Route',
      `Are you sure you want to accept this delivery route with ${route.totalStops} stops?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Accept', onPress: () => onAccept && onAccept(route.id) },
      ]
    );
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const formatDistance = (miles) => {
    return `${miles.toFixed(1)} mi`;
  };

  const getRouteStatusColor = () => {
    switch (route.status) {
      case 'available':
        return colors.success;
      case 'in_progress':
        return colors.warning;
      case 'completed':
        return colors.primary;
      default:
        return colors.gray;
    }
  };

  const getRouteStatusText = () => {
    switch (route.status) {
      case 'available':
        return 'Available';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const getStopTypeColor = (type) => {
    switch (type) {
      case 'pickup':
        return colors.primary;
      case 'dropoff':
        return colors.warning;
      default:
        return colors.gray;
    }
  };

  return (
    <View style={[styles.container, isCurrent && styles.currentRoute, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.routeInfo}>
          <Text style={styles.routeId}>Route #{route.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getRouteStatusColor() }]}>
            <Text style={styles.statusText}>{getRouteStatusText()}</Text>
          </View>
        </View>
        <Text style={styles.earnings}>${route.estimatedEarnings.toFixed(2)}</Text>
      </View>

      {/* Route Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Ionicons name="location-outline" size={16} color={colors.gray} />
          <Text style={styles.summaryText}>{route.totalStops} stops</Text>
        </View>
        <View style={styles.summaryItem}>
          <Ionicons name="time-outline" size={16} color={colors.gray} />
          <Text style={styles.summaryText}>{formatDuration(route.estimatedDuration)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Ionicons name="car-outline" size={16} color={colors.gray} />
          <Text style={styles.summaryText}>{formatDistance(route.totalDistance)}</Text>
        </View>
      </View>

      {/* Stops Preview */}
      <View style={styles.stopsContainer}>
        <Text style={styles.stopsTitle}>Stops:</Text>
        <View style={styles.stopsPreview}>
          {route.stops?.slice(0, 3).map((stop, index) => (
            <View key={index} style={styles.stopItem}>
              <View style={[
                styles.stopIndicator,
                { backgroundColor: getStopTypeColor(stop.type) }
              ]}>
                <Ionicons
                  name={stop.type === 'pickup' ? 'arrow-up' : 'arrow-down'}
                  size={10}
                  color={colors.white}
                />
              </View>
              <Text style={styles.stopAddress} numberOfLines={1}>
                {stop.address}
              </Text>
            </View>
          ))}
          {route.stops?.length > 3 && (
            <Text style={styles.moreStops}>
              +{route.stops.length - 3} more stops
            </Text>
          )}
        </View>
      </View>

      {/* Time and Priority Info */}
      <View style={styles.infoRow}>
        <View style={styles.timeInfo}>
          <Ionicons name="clock-outline" size={14} color={colors.gray} />
          <Text style={styles.timeText}>
            Due by: {route.dueTime || 'No deadline'}
          </Text>
        </View>
        {route.priority && (
          <View style={[
            styles.priorityBadge,
            {
              backgroundColor: route.priority === 'high'
                ? colors.error + '20'
                : route.priority === 'medium'
                ? colors.warning + '20'
                : colors.success + '20'
            }
          ]}>
            <Text style={[
              styles.priorityText,
              {
                color: route.priority === 'high'
                  ? colors.error
                  : route.priority === 'medium'
                  ? colors.warning
                  : colors.success
              }
            ]}>
              {route.priority.toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Special Instructions */}
      {route.specialInstructions && (
        <View style={styles.instructionsContainer}>
          <Ionicons name="information-circle-outline" size={14} color={colors.info} />
          <Text style={styles.instructions} numberOfLines={2}>
            {route.specialInstructions}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        {isCurrent ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.continueButton]}
            onPress={() => onContinue && onContinue(route.id)}
          >
            <Ionicons name="play" size={16} color={colors.white} />
            <Text style={styles.continueButtonText}>Continue Route</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.detailsButton]}
              onPress={() => onViewDetails && onViewDetails(route.id)}
            >
              <Ionicons name="eye-outline" size={16} color={colors.primary} />
              <Text style={styles.detailsButtonText}>Details</Text>
            </TouchableOpacity>
            
            {route.status === 'available' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={handleAccept}
              >
                <Ionicons name="checkmark" size={16} color={colors.white} />
                <Text style={styles.acceptButtonText}>Accept</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {/* Current Route Indicator */}
      {isCurrent && (
        <View style={styles.currentIndicator}>
          <View style={styles.currentDot} />
          <Text style={styles.currentText}>Current Route</Text>
        </View>
      )}
    </View>
  );
}

// Compact route card variant
export function CompactRouteCard({
  route,
  onPress,
  style,
}) {
  return (
    <TouchableOpacity
      style={[styles.compactContainer, style]}
      onPress={() => onPress && onPress(route)}
      activeOpacity={0.7}
    >
      <View style={styles.compactHeader}>
        <Text style={styles.compactRouteId}>Route #{route.id}</Text>
        <Text style={styles.compactEarnings}>${route.estimatedEarnings.toFixed(2)}</Text>
      </View>
      
      <View style={styles.compactSummary}>
        <Text style={styles.compactStops}>{route.totalStops} stops</Text>
        <Text style={styles.compactTime}>{formatDuration(route.estimatedDuration)}</Text>
        <Text style={styles.compactDistance}>{formatDistance(route.totalDistance)}</Text>
      </View>
      
      <View style={[styles.compactStatus, { backgroundColor: getRouteStatusColor() }]}>
        <Text style={styles.compactStatusText}>{getRouteStatusText()}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  currentRoute: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  earnings: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.success,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 12,
    color: colors.gray,
    marginLeft: 4,
  },
  stopsContainer: {
    marginBottom: 12,
  },
  stopsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  stopsPreview: {
    marginLeft: 8,
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stopIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  stopAddress: {
    fontSize: 12,
    color: colors.text,
    flex: 1,
  },
  moreStops: {
    fontSize: 11,
    color: colors.gray,
    fontStyle: 'italic',
    marginLeft: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    color: colors.gray,
    marginLeft: 4,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.info + '10',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  instructions: {
    fontSize: 12,
    color: colors.info,
    marginLeft: 6,
    flex: 1,
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  detailsButton: {
    backgroundColor: colors.primary + '20',
    marginRight: 8,
  },
  detailsButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  acceptButton: {
    backgroundColor: colors.success,
  },
  acceptButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  continueButton: {
    backgroundColor: colors.primary,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  currentIndicator: {
    position: 'absolute',
    top: -8,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  currentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
    marginRight: 4,
  },
  currentText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Compact variant styles
  compactContainer: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    position: 'relative',
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  compactRouteId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  compactEarnings: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.success,
  },
  compactSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  compactStops: {
    fontSize: 11,
    color: colors.gray,
  },
  compactTime: {
    fontSize: 11,
    color: colors.gray,
  },
  compactDistance: {
    fontSize: 11,
    color: colors.gray,
  },
  compactStatus: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
  },
  compactStatusText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: 'bold',
  },
});
