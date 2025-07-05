import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';
import { formatPrice, formatDateTime } from '../../utils/helpers';

export default function RouteCard({ 
  route, 
  onPress,
  style = {}
}) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return Colors.warning;
      case 'active':
        return Colors.success;
      case 'completed':
        return Colors.primary;
      default:
        return Colors.gray;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'active':
        return 'play-circle-outline';
      case 'completed':
        return 'checkmark-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={() => onPress(route)}
      activeOpacity={0.8}
    >
      <View style={[styles.colorBar, { backgroundColor: route.routeColor }]} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.statusContainer}>
            <Ionicons 
              name={getStatusIcon(route.status)} 
              size={20} 
              color={getStatusColor(route.status)} 
            />
            <Text style={[styles.status, { color: getStatusColor(route.status) }]}>
              {route.status.toUpperCase()}
            </Text>
          </View>
          
          <Text style={styles.earnings}>
            {formatPrice(route.totalEarnings)}
          </Text>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color={Colors.textTertiary} />
            <Text style={styles.detailText}>
              {route.orderIds.length} {route.orderIds.length === 1 ? 'stop' : 'stops'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color={Colors.textTertiary} />
            <Text style={styles.detailText}>
              {route.estimatedDuration} min
            </Text>
          </View>

          {route.totalDistance && (
            <View style={styles.detailRow}>
              <Ionicons name="car-outline" size={16} color={Colors.textTertiary} />
              <Text style={styles.detailText}>
                {route.totalDistance} mi
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.timestamp}>
            {route.startTime 
              ? `Started: ${formatDateTime(route.startTime)}`
              : `Created: ${formatDateTime(route.createdAt)}`
            }
          </Text>
          
          <View style={styles.routeActions}>
            <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.borderRadius.lg,
    marginBottom: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  colorBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  status: {
    ...Typography.caption,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  earnings: {
    ...Typography.h3,
    color: Colors.success,
    fontWeight: '700',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginLeft: Spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  routeActions: {
    padding: Spacing.xs,
  },
});
