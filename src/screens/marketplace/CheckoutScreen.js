import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Header from '../../components/common/Header';
import { colors } from '../../utils/colors';
import { api } from '../../services/api';
import { stripeService } from '../../services/stripe';

export default function CheckoutScreen({ navigation, route }) {
  const { items = [] } = route.params || {};
  const { user } = useAuth();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('stripe');
  const [useBusinessProfile, setUseBusinessProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setDeliveryAddress(user.address || '');
      setPhoneNumber(user.phone || '');
    }
  }, [user]);

  const paymentMethods = [
    { id: 'stripe', name: 'Credit/Debit Card', icon: 'card' },
    { id: 'paypal', name: 'PayPal', icon: 'logo-paypal' },
    { id: 'apple_pay', name: 'Apple Pay', icon: 'logo-apple' },
    { id: 'google_pay', name: 'Google Pay', icon: 'logo-google' },
  ];

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 3.99;
    const serviceFee = 1.99;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + deliveryFee + serviceFee + tax;

    return { subtotal, deliveryFee, serviceFee, tax, total };
  };

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      Alert.alert('Error', 'Please enter a delivery address');
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    setLoading(true);
    try {
      const { total } = calculateTotals();
      
      // Create order in backend
      const orderData = {
        items: items.map(item => ({
          listingId: item.id,
          quantity: item.quantity,
          price: item.price,
          sellerId: item.sellerId,
        })),
        deliveryAddress,
        phoneNumber,
        deliveryInstructions,
        paymentMethod: selectedPaymentMethod,
        useBusinessProfile,
        total,
      };

      const orderResponse = await api.post('/orders', orderData);
      const orderId = orderResponse.data.id;

      // Process payment
      if (selectedPaymentMethod === 'stripe') {
        const paymentResult = await stripeService.processPayment(total, orderId);
        
        if (paymentResult.success) {
          // Payment successful
          await api.post(`/orders/${orderId}/confirm-payment`, {
            paymentIntentId: paymentResult.paymentIntent.id,
          });
          
          clearCart();
          
          Alert.alert(
            'Order Placed!',
            'Your order has been placed successfully. You will receive updates on delivery.',
            [
              { text: 'OK', onPress: () => navigation.navigate('OrderTracking', { orderId }) }
            ]
          );
        } else {
          Alert.alert('Payment Failed', paymentResult.error);
        }
      } else {
        // Handle other payment methods
        Alert.alert('Payment Method', 'This payment method is not yet implemented');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, deliveryFee, serviceFee, tax, total } = calculateTotals();

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Checkout"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Order Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Items ({items.length})</Text>
            {items.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
          </View>

          {/* Delivery Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TextInput
              style={styles.input}
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              placeholder="Enter delivery address"
              multiline
            />
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Phone number"
              keyboardType="phone-pad"
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={deliveryInstructions}
              onChangeText={setDeliveryInstructions}
              placeholder="Delivery instructions (optional)"
              multiline
            />
          </View>

          {/* Profile Selection */}
          {user?.businessProfile && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order As</Text>
              <View style={styles.profileOptions}>
                <TouchableOpacity
                  style={[
                    styles.profileOption,
                    !useBusinessProfile && styles.profileOptionActive
                  ]}
                  onPress={() => setUseBusinessProfile(false)}
                >
                  <Ionicons 
                    name={!useBusinessProfile ? "person" : "person-outline"} 
                    size={20} 
                    color={!useBusinessProfile ? colors.white : colors.gray} 
                  />
                  <Text style={[
                    styles.profileOptionText,
                    !useBusinessProfile && styles.profileOptionTextActive
                  ]}>
                    Personal
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.profileOption,
                    useBusinessProfile && styles.profileOptionActive
                  ]}
                  onPress={() => setUseBusinessProfile(true)}
                >
                  <Ionicons 
                    name={useBusinessProfile ? "business" : "business-outline"} 
                    size={20} 
                    color={useBusinessProfile ? colors.white : colors.gray} 
                  />
                  <Text style={[
                    styles.profileOptionText,
                    useBusinessProfile && styles.profileOptionTextActive
                  ]}>
                    Business
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethod,
                  selectedPaymentMethod === method.id && styles.paymentMethodActive
                ]}
                onPress={() => setSelectedPaymentMethod(method.id)}
              >
                <Ionicons 
                  name={method.icon} 
                  size={24} 
                  color={selectedPaymentMethod === method.id ? colors.primary : colors.gray} 
                />
                <Text style={[
                  styles.paymentMethodText,
                  selectedPaymentMethod === method.id && styles.paymentMethodTextActive
                ]}>
                  {method.name}
                </Text>
                {selectedPaymentMethod === method.id && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service Fee</Text>
              <Text style={styles.summaryValue}>${serviceFee.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Place Order Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.placeOrderButton, loading && styles.placeOrderButtonDisabled]}
            onPress={handlePlaceOrder}
            disabled={loading}
          >
            <Text style={styles.placeOrderButtonText}>
              {loading ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.white,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: colors.gray,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: colors.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  profileOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    width: '48%',
    justifyContent: 'center',
  },
  profileOptionActive: {
    backgroundColor: colors.primary,
  },
  profileOptionText: {
    fontSize: 16,
    color: colors.gray,
    marginLeft: 8,
  },
  profileOptionTextActive: {
    color: colors.white,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  paymentMethodActive: {
    backgroundColor: colors.primary + '20',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  paymentMethodText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  paymentMethodTextActive: {
    color: colors.primary,
    fontWeight: '600',
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
  buttonContainer: {
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  placeOrderButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  placeOrderButtonDisabled: {
    opacity: 0.6,
  },
  placeOrderButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
