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

export default function DeliveryItem({
  item,
  isActive = false,
  onNavigate,
  onComplete,
  onContact,
  style,
}) {
  const handleComplete = () => {
    Alert.alert(
      'Complete Stop',
      `Mark this ${item.type} as completed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Complete', onPress: () => onComplete && onComplete(item) },
      ]
    );
  };

  const getTypeColor = () => {
    if (item.completed) return colors.success;
    return item.type === 'pickup' ? colors.primary : colors.warning;
  };

  const getTypeIcon = () => {
    if (item.completed) return 'checkmark-circle';
    return item.type === 'pickup' ? 'arrow-up-circle' : 'arrow-down-circle';
  };

  return (
    <View style={[
      styles.container,
      isActive && styles.activeContainer,
      item.completed && styles.completedContainer,
      style
    ]}>
      {/* Type Indicator */}
      <View style={styles.leftSection}>
        <View style={[styles.typeIndicator, { backgroundColor: getTypeColor() }]}>
          <Ionicons
            name={getTypeIcon()}
            size={24}
            color={colors.white}
          />
        </View>
        <View style={[styles.connector, !item.isLast && styles.connectorLine]} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.type, { color: getTypeColor() }]}>
            {item.type === 'pickup' ? 'PICKUP' : 'DROP-OFF'}
          </Text>
          {item.completed && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark" size={12} color={colors.white} />
              <Text style={styles.completedText}>Completed</Text>
            </View>
          )}
        </View>

        {/* Order Info */}
        {item.orderInfo && (
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>Order #{item.orderInfo.id}</Text>
            <Text style={styles.customerName}>{item.orderInfo.customerName}</Text>
          </View>
        )}

        {/* Address */}
        <View style={styles.addressContainer}>
          <Ionicons name="location-outline" size={16} color={colors.gray} />
          <Text style={styles.address} numberOfLines={2}>
            {item.address}
          </Text>
        </View>

        {/* Items */}
        {item.items && item.items.length > 0 && (
          <View style={styles.itemsContainer}>
            <Text style={styles.itemsTitle}>Items:</Text>
            {item.items.slice(0, 2).map((orderItem, index) => (
              <Text key={index} style={styles.itemText} numberOfLines={1}>
                • {orderItem.quantity}x {orderItem.name}
              </Text>
            ))}
            {item.items.length > 2 && (
              <Text style={styles.moreItems}>+{item.items.length - 2} more items</Text>
            )}
          </View>
        )}

        {/* Special Instructions */}
        {item.instructions && (
          <View style={styles.instructionsContainer}>
            <Ionicons name="information-circle-outline" size={14} color={colors.info} />
            <Text style={styles.instructions} numberOfLines={2}>
              {item.instructions}
            </Text>
          </View>
        )}

        {/* Contact Info */}
        {item.customerPhone && (
          <View style={styles.contactContainer}>
            <Ionicons name="call-outline" size={14} color={colors.gray} />
            <Text style={styles.contactText}>{item.customerPhone}</Text>
          </View>
        )}

        {/* Action Buttons */}
        {!item.completed && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.navigateButton]}
              onPress={() => onNavigate && onNavigate(item)}
            >
              <Ionicons name="navigate" size={16} color={colors.primary} />
              <Text style={styles.navigateButtonText}>Navigate</Text>
            </TouchableOpacity>

            {item.customerPhone && (
              <TouchableOpacity
                style={[styles.actionButton, styles.contactButton]}
                onPress={() => onContact && onContact(item)}
              >
                <Ionicons name="call" size={16} color={colors.success} />
                <Text style={styles.contactButtonText}>Call</Text>
              </TouchableOpacity>
            )}

            {isActive && (
              <TouchableOpacity
                style={[styles.actionButton, styles.completeButton]}
                onPress={handleComplete}
              >
                <Ionicons name="checkmark" size={16} color={colors.white} />
                <Text style={styles.completeButtonText}>Complete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Timing Info */}
        <View style={styles.timingInfo}>
          {item.estimatedTime && (
            <Text style={styles.timingText}>
              ETA: {item.estimatedTime}
            </Text>
          )}
          {item.completedAt && (
            <Text style={styles.timingText}>
              Completed: {item.completedAt}
            </Text>
          )}
        </View>
      </View>

      {/* Status Indicator */}
      {isActive && !item.completed && (
        <View style={styles.activeIndicator}>
          <Text style={styles.activeText}>CURRENT</Text>
        </View>
      )}
    </View>
  );
}

// Compact delivery item for lists
export function CompactDeliveryItem({
  item,
  onPress,
  style,
}) {
  const getTypeColor = () => {
    if (item.completed) return colors.success;
    return item.type === 'pickup' ? colors.primary : colors.warning;
  };

  return (
    <TouchableOpacity
      style={[styles.compactContainer, style]}
      onPress={() => onPress && onPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.compactIndicator, { backgroundColor: getTypeColor() }]}>
        <Ionicons
          name={item.type === 'pickup' ? 'arrow-up' : 'arrow-down'}
          size={12}
          color={colors.white}
        />
      </View>

      <View style={styles.compactContent}>
        <Text style={styles.compactType}>
          {item.type === 'pickup' ? 'PICKUP' : 'DROP-OFF'}
        </Text>
        <Text style={styles.compactAddress} numberOfLines={1}>
          {item.address}
        </Text>
        {item.orderInfo && (
          <Text style={styles.compactOrder}>
            Order #{item.orderInfo.id}
          </Text>
        )}
      </View>

      {item.completed && (
        <Ionicons name="checkmark-circle" size={20} color={colors.success} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: 'relative',
  },
  activeContainer: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  completedContainer: {
    opacity: 0.7,
  },
  leftSection: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingLeft: 16,
    position: 'relative',
  },
  typeIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connector: {
    width: 2,
    flex: 1,
    marginTop: 8,
  },
  connectorLine: {
    backgroundColor: colors.lightGray,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingLeft: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  type: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  completedText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  orderInfo: {
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  customerName: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 6,
    flex: 1,
    lineHeight: 18,
  },
  itemsContainer: {
    marginBottom: 8,
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 6,
  },
  itemsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  itemText: {
    fontSize: 11,
    color: colors.gray,
    marginBottom: 2,
  },
  moreItems: {
    fontSize: 11,
    color: colors.gray,
    fontStyle: 'italic',
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.info + '10',
    padding: 6,
    borderRadius: 4,
    marginBottom: 8,
  },
  instructions: {
    fontSize: 11,
    color: colors.info,
    marginLeft: 4,
    flex: 1,
    lineHeight: 14,
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 12,
    color: colors.gray,
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 2,
    justifyContent: 'center',
  },
  navigateButton: {
    backgroundColor: colors.primary + '20',
  },
  navigateButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  contactButton: {
    backgroundColor: colors.success + '20',
  },
  contactButtonText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  completeButton: {
    backgroundColor: colors.success,
  },
  completeButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  timingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timingText: {
    fontSize: 10,
    color: colors.gray,
  },
  activeIndicator: {
    position: 'absolute',
    top: -6,
    right: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: 'bold',
  },

  // Compact variant styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  compactIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  compactContent: {
    flex: 1,
  },
  compactType: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.gray,
    marginBottom: 2,
  },
  compactAddress: {
    fontSize: 12,
    color: colors.text,
    marginBottom: 2,
  },
  compactOrder: {
    fontSize: 10,
    color: colors.gray,
  },
});
