import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/common/Header';
import CartItem from '../../components/marketplace/CartItem';
import { colors } from '../../utils/colors';

export default function CartScreen({ navigation }) {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getCartTotal 
  } = useCart();
  const { user } = useAuth();

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', onPress: () => removeFromCart(itemId) },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', onPress: clearCart },
      ]
    );
  };

  const handleCheckout = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to proceed with checkout');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Add items to your cart before checkout');
      return;
    }

    navigation.navigate('Checkout', { items: cartItems });
  };

  const renderCartItem = ({ item }) => (
    <CartItem
      item={item}
      onQuantityChange={handleQuantityChange}
      onRemove={handleRemoveItem}
    />
  );

  const cartTotal = getCartTotal();
  const deliveryFee = cartItems.length > 0 ? 3.99 : 0;
  const serviceFee = cartItems.length > 0 ? 1.99 : 0;
  const finalTotal = cartTotal + deliveryFee + serviceFee;

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Cart"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={
          cartItems.length > 0 && (
            <TouchableOpacity onPress={handleClearCart}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )
        }
      />

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color={colors.gray} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Add items from the marketplace to get started
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Marketplace')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.content}>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.cartList}
            showsVerticalScrollIndicator={false}
          />

          {/* Cart Summary */}
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${cartTotal.toFixed(2)}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service Fee</Text>
              <Text style={styles.summaryValue}>${serviceFee.toFixed(2)}</Text>
            </View>
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${finalTotal.toFixed(2)}</Text>
            </View>

            {/* Delivery Info */}
            <View style={styles.deliveryInfo}>
              <View style={styles.deliveryRow}>
                <Ionicons name="time-outline" size={20} color={colors.primary} />
                <Text style={styles.deliveryText}>Estimated delivery: 30-45 min</Text>
              </View>
              <View style={styles.deliveryRow}>
                <Ionicons name="location-outline" size={20} color={colors.primary} />
                <Text style={styles.deliveryText}>
                  {user?.address || 'Add delivery address'}
                </Text>
              </View>
            </View>

            {/* Checkout Button */}
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutButtonText}>
                Proceed to Checkout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  clearText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  shopButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  cartList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  summaryContainer: {
    backgroundColor: colors.white,
    padding: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.text,
  },
  summaryValue: {
    fontSize: 16,
    color: colors.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  deliveryInfo: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  checkoutButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
