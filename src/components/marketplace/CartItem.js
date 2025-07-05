import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils/colors';

export default function CartItem({
  item,
  onQuantityChange,
  onRemove,
  onSellerPress,
  style,
  showSeller = true,
  editable = true,
}) {
  const handleQuantityDecrease = () => {
    if (item.quantity > 1) {
      onQuantityChange(item.id, item.quantity - 1);
    } else {
      Alert.alert(
        'Remove Item',
        'Do you want to remove this item from your cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', onPress: () => onRemove(item.id) },
        ]
      );
    }
  };

  const handleQuantityIncrease = () => {
    if (item.quantity < 99) {
      onQuantityChange(item.id, item.quantity + 1);
    }
  };

  const handleRemove = () => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', onPress: () => onRemove(item.id) },
      ]
    );
  };

  const getItemTotal = () => {
    return (item.price * item.quantity).toFixed(2);
  };

  return (
    <View style={[styles.container, style]}>
      {/* Item Image */}
      <Image
        source={{
          uri: item.image || 'https://via.placeholder.com/80x80/CCCCCC/FFFFFF?text=No+Image'
        }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Item Details */}
      <View style={styles.details}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Seller Info */}
        {showSeller && item.seller && (
          <TouchableOpacity
            style={styles.sellerContainer}
            onPress={() => onSellerPress && onSellerPress(item.seller)}
          >
            <Ionicons name="storefront-outline" size={14} color={colors.gray} />
            <Text style={styles.sellerName} numberOfLines={1}>
              {item.seller.name || 'Unknown Seller'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Price and Quantity Row */}
        <View style={styles.priceQuantityRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${item.price.toFixed(2)}</Text>
            {item.quantity > 1 && (
              <Text style={styles.totalPrice}>
                Total: ${getItemTotal()}
              </Text>
            )}
          </View>

          {editable && (
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={handleQuantityDecrease}
              >
                <Ionicons
                  name={item.quantity === 1 ? 'trash-outline' : 'remove'}
                  size={16}
                  color={item.quantity === 1 ? colors.error : colors.text}
                />
              </TouchableOpacity>

              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{item.quantity}</Text>
              </View>

              <TouchableOpacity
                style={styles.quantityButton}
                onPress={handleQuantityIncrease}
              >
                <Ionicons name="add" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
          )}

          {!editable && (
            <Text style={styles.quantityLabel}>Qty: {item.quantity}</Text>
          )}
        </View>

        {/* Item Options/Variants */}
        {item.selectedOptions && (
          <View style={styles.optionsContainer}>
            {item.selectedOptions.map((option, index) => (
              <View key={index} style={styles.optionItem}>
                <Text style={styles.optionText}>
                  {option.name}: {option.value}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Special Notes */}
        {item.notes && (
          <View style={styles.notesContainer}>
            <Ionicons name="document-text-outline" size={14} color={colors.gray} />
            <Text style={styles.notes} numberOfLines={2}>
              {item.notes}
            </Text>
          </View>
        )}

        {/* Delivery Info */}
        {item.deliveryInfo && (
          <View style={styles.deliveryContainer}>
            <Ionicons name="car-outline" size={14} color={colors.primary} />
            <Text style={styles.deliveryText}>
              {item.deliveryInfo}
            </Text>
          </View>
        )}
      </View>

      {/* Remove Button */}
      {editable && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={handleRemove}
        >
          <Ionicons name="close" size={20} color={colors.gray} />
        </TouchableOpacity>
      )}

      {/* Stock Status */}
      {item.stockStatus && (
        <View style={[
          styles.stockBadge,
          {
            backgroundColor: item.stockStatus === 'in_stock'
              ? colors.success + '20'
              : item.stockStatus === 'low_stock'
              ? colors.warning + '20'
              : colors.error + '20'
          }
        ]}>
          <Text style={[
            styles.stockText,
            {
              color: item.stockStatus === 'in_stock'
                ? colors.success
                : item.stockStatus === 'low_stock'
                ? colors.warning
                : colors.error
            }
          ]}>
            {item.stockStatus === 'in_stock' && 'In Stock'}
            {item.stockStatus === 'low_stock' && 'Low Stock'}
            {item.stockStatus === 'out_of_stock' && 'Out of Stock'}
          </Text>
        </View>
      )}
    </View>
  );
}

// Simple cart item variant for checkout
export function SimpleCartItem({ item, style }) {
  return (
    <View style={[styles.simpleContainer, style]}>
      <Image
        source={{
          uri: item.image || 'https://via.placeholder.com/60x60/CCCCCC/FFFFFF?text=No+Image'
        }}
        style={styles.simpleImage}
        resizeMode="cover"
      />
      <View style={styles.simpleDetails}>
        <Text style={styles.simpleTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.simpleQuantity}>Qty: {item.quantity}</Text>
      </View>
      <Text style={styles.simplePrice}>
        ${(item.price * item.quantity).toFixed(2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: 'relative',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sellerName: {
    fontSize: 12,
    color: colors.gray,
    marginLeft: 4,
    flex: 1,
  },
  priceQuantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  totalPrice: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
  },
  quantityDisplay: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  quantityLabel: {
    fontSize: 14,
    color: colors.gray,
  },
  optionsContainer: {
    marginBottom: 8,
  },
  optionItem: {
    marginBottom: 2,
  },
  optionText: {
    fontSize: 12,
    color: colors.gray,
    fontStyle: 'italic',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notes: {
    fontSize: 12,
    color: colors.gray,
    marginLeft: 4,
    flex: 1,
    fontStyle: 'italic',
  },
  deliveryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 4,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stockText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // Simple variant styles
  simpleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  simpleImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  simpleDetails: {
    flex: 1,
  },
  simpleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  simpleQuantity: {
    fontSize: 12,
    color: colors.gray,
  },
  simplePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
});
