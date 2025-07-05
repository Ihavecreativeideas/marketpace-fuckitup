import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function Cart({ navigation }: any) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['/api/cart'],
    queryFn: () => apiRequest('GET', '/api/cart'),
    enabled: !!user,
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (listingId: number) => {
      return apiRequest('DELETE', `/api/cart/${listingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: 'Item Removed',
        description: 'Item removed from cart',
        variant: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to remove item from cart',
        variant: 'error',
      });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ listingId, quantity }: { listingId: number; quantity: number }) => {
      return apiRequest('PUT', `/api/cart/${listingId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update quantity',
        variant: 'error',
      });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('DELETE', '/api/cart');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: 'Cart Cleared',
        description: 'All items removed from cart',
        variant: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to clear cart',
        variant: 'error',
      });
    },
  });

  const calculateTotal = () => {
    return cartItems.reduce((total: number, item: any) => {
      return total + (parseFloat(item.listing.price) * item.quantity);
    }, 0);
  };

  const calculateDeliveryFee = () => {
    // Base delivery fee calculation
    const baseDeliveryFee = 2.99;
    const itemCount = cartItems.length;
    const additionalItemFee = Math.max(0, (itemCount - 1) * 0.99);
    return baseDeliveryFee + additionalItemFee;
  };

  const handleRemoveItem = (listingId: number) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeFromCartMutation.mutate(listingId)
        },
      ]
    );
  };

  const handleUpdateQuantity = (listingId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(listingId);
    } else {
      updateQuantityMutation.mutate({ listingId, quantity: newQuantity });
    }
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => clearCartMutation.mutate()
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Add items to your cart before checking out',
        variant: 'error',
      });
      return;
    }
    navigation.navigate('Checkout');
  };

  const renderCartItem = ({ item }: { item: any }) => (
    <Card style={styles.cartItem}>
      <View style={styles.itemContent}>
        <Image
          source={{
            uri: item.listing.images?.[0] || 'https://via.placeholder.com/80x80',
          }}
          style={styles.itemImage}
        />
        
        <View style={styles.itemDetails}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.listing.title}
          </Text>
          <Text style={styles.itemSeller}>
            By {item.listing.user?.firstName} {item.listing.user?.lastName}
          </Text>
          <View style={styles.itemMeta}>
            <Text style={styles.itemPrice}>${item.listing.price}</Text>
            {item.listing.isRental && (
              <Badge text="Rental" variant="warning" size="small" />
            )}
          </View>
        </View>

        <View style={styles.itemActions}>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveItem(item.listing.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
          
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleUpdateQuantity(item.listing.id, item.quantity - 1)}
            >
              <Ionicons name="remove" size={16} color="#666" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleUpdateQuantity(item.listing.id, item.quantity + 1)}
            >
              <Ionicons name="add" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Card>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyCart}>
      <Ionicons name="cart-outline" size={80} color="#ccc" />
      <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
      <Text style={styles.emptyCartSubtitle}>
        Browse the marketplace to find items you want to buy
      </Text>
      <Button
        title="Start Shopping"
        onPress={() => navigation.navigate('MarketplaceHome')}
        style={styles.startShoppingButton}
      />
    </View>
  );

  const total = calculateTotal();
  const deliveryFee = calculateDeliveryFee();
  const grandTotal = total + deliveryFee;

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cart</Text>
        </View>
        {renderEmptyCart()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cart ({cartItems.length})</Text>
        <TouchableOpacity onPress={handleClearCart}>
          <Text style={styles.clearAllText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Cart Items */}
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.cartList}
        showsVerticalScrollIndicator={false}
      />

      {/* Order Summary */}
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal ({cartItems.length} items)</Text>
          <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Fee</Text>
          <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
        </View>
        
        <View style={styles.summaryDivider} />
        
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${grandTotal.toFixed(2)}</Text>
        </View>
        
        <Text style={styles.deliveryNote}>
          <Ionicons name="information-circle" size={14} color="#666" />
          {' '}Delivery routes are optimized for up to 6 items (12 stops total)
        </Text>
      </Card>

      {/* Delivery Options */}
      <Card style={styles.deliveryCard}>
        <Text style={styles.deliveryTitle}>Delivery Options</Text>
        
        <TouchableOpacity style={styles.deliveryOption}>
          <View style={styles.deliveryOptionLeft}>
            <Ionicons name="car" size={20} color="#007AFF" />
            <Text style={styles.deliveryOptionText}>MarketPace Delivery</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#ccc" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.deliveryOption}>
          <View style={styles.deliveryOptionLeft}>
            <Ionicons name="walk" size={20} color="#4CAF50" />
            <Text style={styles.deliveryOptionText}>Self Pickup (Pro Feature)</Text>
          </View>
          <View style={styles.deliveryOptionRight}>
            <Badge text="Pro" variant="warning" size="small" />
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </View>
        </TouchableOpacity>
      </Card>

      {/* Checkout Button */}
      <View style={styles.checkoutContainer}>
        <Button
          title={`Proceed to Checkout • $${grandTotal.toFixed(2)}`}
          onPress={handleCheckout}
          style={styles.checkoutButton}
        />
        
        <Text style={styles.checkoutNote}>
          You'll be able to review your order before payment
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  clearAllText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '500',
  },
  cartList: {
    padding: 16,
  },
  cartItem: {
    marginBottom: 12,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemSeller: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 8,
  },
  itemActions: {
    alignItems: 'center',
  },
  removeButton: {
    padding: 8,
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
  },
  quantityButton: {
    padding: 8,
    minWidth: 32,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    minWidth: 24,
    textAlign: 'center',
  },
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  deliveryNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 12,
    lineHeight: 16,
  },
  deliveryCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  deliveryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  deliveryOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryOptionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  deliveryOptionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkoutContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  checkoutButton: {
    marginBottom: 8,
  },
  checkoutNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyCartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyCartSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  startShoppingButton: {
    minWidth: 150,
  },
});
