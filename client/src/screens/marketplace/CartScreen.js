import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';
import { useCart, useRemoveFromCart, useCreateOrder } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { formatPrice } from '../../utils/helpers';
import Header from '../../components/common/Header';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

export default function CartScreen({ navigation }) {
  const { user } = useAuth();
  const { data: cartItems, isLoading, error, refetch } = useCart();
  const removeFromCartMutation = useRemoveFromCart();
  const createOrderMutation = useCreateOrder();

  const [selectedItems, setSelectedItems] = useState(new Set());

  const handleSelectItem = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === cartItems?.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems?.map(item => item.id) || []));
    }
  };

  const handleRemoveItem = async (itemId) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromCartMutation.mutateAsync(itemId);
              setSelectedItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(itemId);
                return newSet;
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to remove item from cart');
            }
          }
        }
      ]
    );
  };

  const handleCheckout = () => {
    const selectedCartItems = cartItems?.filter(item => selectedItems.has(item.id)) || [];
    
    if (selectedCartItems.length === 0) {
      Alert.alert('No Items Selected', 'Please select items to checkout');
      return;
    }

    const totalAmount = selectedCartItems.reduce((sum, item) => {
      return sum + (parseFloat(item.listing?.price || 0) * item.quantity);
    }, 0);

    navigation.navigate('Checkout', {
      items: selectedCartItems,
      totalAmount,
    });
  };

  const calculateSubtotal = () => {
    if (!cartItems) return 0;
    const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
    return selectedCartItems.reduce((sum, item) => {
      return sum + (parseFloat(item.listing?.price || 0) * item.quantity);
    }, 0);
  };

  const estimatedDeliveryFee = selectedItems.size > 0 ? 5.99 : 0;
  const subtotal = calculateSubtotal();
  const total = subtotal + estimatedDeliveryFee;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage 
        title="Unable to load cart"
        message={error.message}
        onRetry={refetch}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Shopping Cart"
        showBackButton
        navigation={navigation}
      />
      
      {(!cartItems || cartItems.length === 0) ? (
        <View style={styles.emptyState}>
          <Ionicons name="bag-outline" size={64} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>
            Start shopping to add items to your cart
          </Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.emptyButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Select All */}
            <View style={styles.selectAllContainer}>
              <TouchableOpacity
                style={styles.selectAllButton}
                onPress={handleSelectAll}
              >
                <Ionicons 
                  name={selectedItems.size === cartItems.length ? "checkbox" : "square-outline"} 
                  size={24} 
                  color={selectedItems.size === cartItems.length ? Colors.primary : Colors.gray} 
                />
                <Text style={styles.selectAllText}>
                  Select All ({cartItems.length} items)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Cart Items */}
            <View style={styles.itemsContainer}>
              {cartItems.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  isSelected={selectedItems.has(item.id)}
                  onSelect={() => handleSelectItem(item.id)}
                  onRemove={() => handleRemoveItem(item.id)}
                  onPress={() => navigation.navigate('ListingDetail', { listingId: item.listingId })}
                />
              ))}
            </View>

            {/* Order Summary */}
            {selectedItems.size > 0 && (
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>Order Summary</Text>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Subtotal ({selectedItems.size} items)
                  </Text>
                  <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Estimated Delivery</Text>
                  <Text style={styles.summaryValue}>{formatPrice(estimatedDeliveryFee)}</Text>
                </View>
                
                <View style={styles.summaryDivider} />
                
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>{formatPrice(total)}</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Bottom Actions */}
          {selectedItems.size > 0 && (
            <View style={styles.bottomActions}>
              <View style={styles.totalContainer}>
                <Text style={styles.bottomTotal}>{formatPrice(total)}</Text>
                <Text style={styles.bottomTotalLabel}>
                  {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''}
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={handleCheckout}
                disabled={createOrderMutation.isLoading}
              >
                <Text style={styles.checkoutButtonText}>
                  {createOrderMutation.isLoading ? 'Processing...' : 'Checkout'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

function CartItemCard({ item, isSelected, onSelect, onRemove, onPress }) {
  const listing = item.listing;
  const defaultImage = 'https://via.placeholder.com/80x80?text=No+Image';
  const imageUrl = listing?.images?.length > 0 ? listing.images[0] : defaultImage;

  return (
    <View style={styles.itemCard}>
      <TouchableOpacity style={styles.checkbox} onPress={onSelect}>
        <Ionicons 
          name={isSelected ? "checkbox" : "square-outline"} 
          size={24} 
          color={isSelected ? Colors.primary : Colors.gray} 
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.itemContent} onPress={onPress}>
        <Image source={{ uri: imageUrl }} style={styles.itemImage} />
        
        <View style={styles.itemDetails}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {listing?.title || 'Unknown Item'}
          </Text>
          
          <Text style={styles.itemPrice}>
            {formatPrice(listing?.price || 0)}
            {listing?.isRental && (
              <Text style={styles.rentalPeriod}>
                {' '}/ {listing.rentalPeriod}
              </Text>
            )}
          </Text>
          
          <View style={styles.itemMeta}>
            <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
            <Text style={styles.itemLocation}>{listing?.location}</Text>
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
        <Ionicons name="trash-outline" size={20} color={Colors.error} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
  },
  emptyButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
  selectAllContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectAllText: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
    fontWeight: '500',
  },
  itemsContainer: {
    backgroundColor: Colors.white,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  checkbox: {
    marginRight: Spacing.md,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: Spacing.borderRadius.md,
    backgroundColor: Colors.lightGray,
    marginRight: Spacing.md,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  itemPrice: {
    ...Typography.h3,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  rentalPeriod: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemQuantity: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  itemLocation: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  removeButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  summaryContainer: {
    backgroundColor: Colors.white,
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Spacing.borderRadius.lg,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  summaryValue: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.lightGray,
    marginVertical: Spacing.md,
  },
  totalLabel: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  totalValue: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: '700',
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  totalContainer: {
    flex: 1,
  },
  bottomTotal: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: '700',
  },
  bottomTotalLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  checkoutButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    marginLeft: Spacing.md,
  },
  checkoutButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
});
