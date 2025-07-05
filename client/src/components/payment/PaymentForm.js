import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';
import { formatPrice } from '../../utils/helpers';

export default function PaymentForm({ 
  amount, 
  onPaymentSuccess,
  onPaymentError,
  style = {}
}) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('stripe');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    { id: 'stripe', name: 'Credit/Debit Card', icon: 'card-outline' },
    { id: 'paypal', name: 'PayPal', icon: 'logo-paypal' },
    { id: 'apple-pay', name: 'Apple Pay', icon: 'logo-apple' },
    { id: 'google-pay', name: 'Google Pay', icon: 'logo-google' },
  ];

  const handlePayment = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For now, just simulate success
      if (Math.random() > 0.1) { // 90% success rate
        onPaymentSuccess({
          paymentMethod: selectedPaymentMethod,
          amount,
          transactionId: `txn_${Date.now()}`,
        });
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      onPaymentError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Method</Text>
        <Text style={styles.amount}>{formatPrice(amount)}</Text>
      </View>

      <View style={styles.paymentMethods}>
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.paymentMethod,
              selectedPaymentMethod === method.id && styles.selectedMethod
            ]}
            onPress={() => setSelectedPaymentMethod(method.id)}
          >
            <View style={styles.methodContent}>
              <Ionicons 
                name={method.icon} 
                size={24} 
                color={selectedPaymentMethod === method.id ? Colors.primary : Colors.textSecondary} 
              />
              <Text style={[
                styles.methodName,
                selectedPaymentMethod === method.id && styles.selectedMethodText
              ]}>
                {method.name}
              </Text>
            </View>
            
            {selectedPaymentMethod === method.id && (
              <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          <Text style={styles.payButtonText}>
            {isProcessing ? 'Processing...' : `Pay ${formatPrice(amount)}`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.borderRadius.lg,
    padding: Spacing.lg,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  amount: {
    ...Typography.h2,
    color: Colors.primary,
    fontWeight: '700',
  },
  paymentMethods: {
    marginBottom: Spacing.xl,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: Spacing.borderRadius.md,
    marginBottom: Spacing.sm,
  },
  selectedMethod: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight + '10',
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodName: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginLeft: Spacing.md,
  },
  selectedMethodText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  footer: {
    marginTop: Spacing.md,
  },
  payButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: Colors.gray,
  },
  payButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
});
