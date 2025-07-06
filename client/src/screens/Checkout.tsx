import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StripeProvider, useStripe, CardField } from '../components/web/StripeWeb';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

function CheckoutForm({ navigation }: any) {
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [saveCard, setSaveCard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { confirmPayment } = useStripe();

  const { data: cartItems = [] } = useQuery({
    queryKey: ['/api/cart'],
    queryFn: () => apiRequest('GET', '/api/cart'),
    enabled: !!user,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return apiRequest('POST', '/api/orders', orderData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: 'Order Placed',
        description: 'Your order has been placed successfully',
        variant: 'success',
      });
      navigation.navigate('OrderConfirmation');
    },
    onError: () => {
      toast({
        title: 'Order Failed',
        description: 'Failed to place order. Please try again.',
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
    const baseDeliveryFee = 2.99;
    const itemCount = cartItems.length;
    const additionalItemFee = Math.max(0, (itemCount - 1) * 0.99);
    return baseDeliveryFee + additionalItemFee;
  };

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      toast({
        title: 'Missing Address',
        description: 'Please enter a delivery address',
        variant: 'error',
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Your cart is empty',
        variant: 'error',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const total = calculateTotal();
      const deliveryFee = calculateDeliveryFee();
      const grandTotal = total + deliveryFee;

      // Create payment intent
      const paymentIntentResponse = await apiRequest('POST', '/api/create-payment-intent', {
        amount: grandTotal,
      });

      if (paymentMethod === 'card') {
        // Confirm payment with Stripe
        const { error } = await confirmPayment(paymentIntentResponse.clientSecret, {
          paymentMethodType: 'Card',
        });

        if (error) {
          toast({
            title: 'Payment Failed',
            description: error.message,
            variant: 'error',
          });
          return;
        }
      }

      // Create order
      const orderData = {
        totalAmount: grandTotal,
        deliveryFee,
        deliveryAddress,
        deliveryInstructions,
        paymentMethod,
        stripePaymentIntentId: paymentIntentResponse.clientSecret,
      };

      await createOrderMutation.mutateAsync(orderData);
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: 'Order Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const total = calculateTotal();
  const deliveryFee = calculateDeliveryFee();
  const grandTotal = total + deliveryFee;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Order Summary */}
      <Card style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        
        {cartItems.map((item: any) => (
          <View key={item.id} style={styles.orderItem}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.listing.title}
            </Text>
            <Text style={styles.itemQuantity}>x{item.quantity}</Text>
            <Text style={styles.itemPrice}>
              ${(parseFloat(item.listing.price) * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}

        <View style={styles.summaryDivider} />
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
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
      </Card>

      {/* Delivery Information */}
      <Card style={styles.deliveryCard}>
        <Text style={styles.sectionTitle}>Delivery Information</Text>
        
        <Input
          label="Delivery Address"
          value={deliveryAddress}
          onChangeText={setDeliveryAddress}
          placeholder="Enter your delivery address"
          multiline
          numberOfLines={2}
        />
        
        <Input
          label="Delivery Instructions (Optional)"
          value={deliveryInstructions}
          onChangeText={setDeliveryInstructions}
          placeholder="e.g., Leave at front door, Ring doorbell"
          multiline
          numberOfLines={2}
        />

        <View style={styles.deliveryEstimate}>
          <Ionicons name="time-outline" size={20} color="#007AFF" />
          <Text style={styles.deliveryEstimateText}>
            Estimated delivery: 30-60 minutes
          </Text>
        </View>
      </Card>

      {/* Payment Method */}
      <Card style={styles.paymentCard}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        
        <View style={styles.paymentMethods}>
          <TouchableOpacity
            style={[
              styles.paymentMethod,
              paymentMethod === 'card' && styles.selectedPaymentMethod,
            ]}
            onPress={() => setPaymentMethod('card')}
          >
            <Ionicons name="card" size={20} color="#007AFF" />
            <Text style={styles.paymentMethodText}>Credit/Debit Card</Text>
            {paymentMethod === 'card' && (
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.paymentMethod,
              paymentMethod === 'apple_pay' && styles.selectedPaymentMethod,
            ]}
            onPress={() => setPaymentMethod('apple_pay')}
          >
            <Ionicons name="phone-portrait" size={20} color="#007AFF" />
            <Text style={styles.paymentMethodText}>Apple Pay</Text>
            {paymentMethod === 'apple_pay' && (
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            )}
          </TouchableOpacity>
        </View>

        {paymentMethod === 'card' && (
          <View style={styles.cardInputContainer}>
            <Text style={styles.cardInputLabel}>Card Information</Text>
            <CardField
              postalCodeEnabled={true}
              placeholders={{
                number: '4242 4242 4242 4242',
              }}
              cardStyle={styles.cardInput}
              style={styles.cardField}
            />
            
            <View style={styles.saveCardContainer}>
              <Text style={styles.saveCardText}>Save card for future purchases</Text>
              <Switch
                value={saveCard}
                onValueChange={setSaveCard}
                trackColor={{ false: '#767577', true: '#007AFF' }}
                thumbColor={saveCard ? '#ffffff' : '#f4f3f4'}
              />
            </View>
          </View>
        )}
      </Card>

      {/* Order Notes */}
      <Card style={styles.notesCard}>
        <View style={styles.noteItem}>
          <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
          <Text style={styles.noteText}>
            Your payment is secure and encrypted
          </Text>
        </View>
        
        <View style={styles.noteItem}>
          <Ionicons name="time-outline" size={20} color="#FF9800" />
          <Text style={styles.noteText}>
            You have 5 minutes to accept/decline after delivery
          </Text>
        </View>
        
        <View style={styles.noteItem}>
          <Ionicons name="refresh-outline" size={20} color="#2196F3" />
          <Text style={styles.noteText}>
            Returns available before delivery completion
          </Text>
        </View>
      </Card>

      {/* Place Order Button */}
      <View style={styles.checkoutContainer}>
        <Button
          title={`Place Order • $${grandTotal.toFixed(2)}`}
          onPress={handlePlaceOrder}
          loading={isProcessing}
          disabled={isProcessing}
          style={styles.placeOrderButton}
        />
        
        <Text style={styles.checkoutNote}>
          By placing this order, you agree to MarketPace's terms of service
        </Text>
      </View>
    </ScrollView>
  );
}

export default function Checkout({ navigation }: any) {
  return (
    <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_default'}>
      <CheckoutForm navigation={navigation} />
    </StripeProvider>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryCard: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 12,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
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
  deliveryCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  deliveryEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
  },
  deliveryEstimateText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  paymentCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  paymentMethods: {
    marginBottom: 16,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedPaymentMethod: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  paymentMethodText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  cardInputContainer: {
    marginTop: 8,
  },
  cardInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  cardField: {
    width: '100%',
    height: 50,
  },
  cardInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
  },
  saveCardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  saveCardText: {
    fontSize: 14,
    color: '#333',
  },
  notesCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  checkoutContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  placeOrderButton: {
    marginBottom: 8,
  },
  checkoutNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
});
