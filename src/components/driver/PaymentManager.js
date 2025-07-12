import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils/colors';
import { useStripe } from '@stripe/stripe-react-native';

export default function PaymentManager({ delivery, onPaymentComplete, visible, onClose }) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [paymentBreakdown, setPaymentBreakdown] = useState(null);

  const calculatePayments = () => {
    const pickupFee = 4.00;
    const dropoffFee = 2.00;
    const baseMileage = Math.min(delivery.mileage || 5, 15);
    const overageMileage = Math.max((delivery.mileage || 5) - 15, 0);
    const mileageFee = baseMileage * 0.50;
    const overageFee = overageMileage * 1.00;
    const largeBonusFee = delivery.isLarge ? 25.00 : 0;
    
    // Platform commission (15% of mileage only)
    const platformCommission = (mileageFee + overageFee) * 0.15;
    const driverMileageNet = (mileageFee + overageFee) - platformCommission;
    
    // Total driver earnings (pickup + dropoff + net mileage + large bonus + tips)
    const driverTotal = pickupFee + dropoffFee + driverMileageNet + largeBonusFee + (delivery.tips || 0);
    
    // Delivery fees split 50/50 between buyer and seller
    const totalDeliveryFee = pickupFee + dropoffFee + mileageFee + overageFee + largeBonusFee;
    const buyerPortion = totalDeliveryFee / 2;
    const sellerPortion = totalDeliveryFee / 2;
    
    return {
      pickupFee,
      dropoffFee,
      mileageFee,
      overageFee,
      largeBonusFee,
      platformCommission,
      driverTotal,
      buyerPortion,
      sellerPortion,
      totalDeliveryFee,
      driverMileageNet
    };
  };

  const handlePaymentProcess = async () => {
    setLoading(true);
    try {
      const breakdown = calculatePayments();
      setPaymentBreakdown(breakdown);

      // Initialize Stripe payment sheet for driver payout
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'MarketPace Driver Payments',
        paymentIntentClientSecret: await getDriverPaymentIntent(breakdown.driverTotal),
        allowsDelayedPaymentMethods: false,
        returnURL: 'marketpace://payment-complete',
      });

      if (initError) {
        Alert.alert('Payment Error', initError.message);
        return;
      }

      // Present payment sheet
      const { error: presentError } = await presentPaymentSheet();
      
      if (presentError) {
        Alert.alert('Payment Error', presentError.message);
        return;
      }

      // Payment successful
      Alert.alert(
        'Payment Complete!',
        `Driver earnings: $${breakdown.driverTotal.toFixed(2)}\nPayment processed via Stripe`,
        [{ text: 'OK', onPress: () => onPaymentComplete(breakdown) }]
      );
      
    } catch (error) {
      Alert.alert('Error', 'Failed to process payment');
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDriverPaymentIntent = async (amount) => {
    // Mock API call - in production, this would create a real Stripe payment intent
    const response = await fetch('/api/drivers/payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to cents
        deliveryId: delivery.id,
        paymentType: 'driver_earnings'
      }),
    });
    
    const data = await response.json();
    return data.clientSecret;
  };

  const handleBuyerRejectionPayment = async () => {
    const breakdown = calculatePayments();
    
    Alert.alert(
      'Item Rejected by Buyer',
      `Buyer will be charged their delivery portion: $${breakdown.buyerPortion.toFixed(2)}\n` +
      `Driver compensation: $${(breakdown.pickupFee + breakdown.driverMileageNet / 2).toFixed(2)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Process Payment', 
          onPress: () => processBuyerRejectionPayment(breakdown) 
        }
      ]
    );
  };

  const processBuyerRejectionPayment = async (breakdown) => {
    try {
      const response = await fetch('/api/drivers/buyer-rejection-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryId: delivery.id,
          buyerCharge: breakdown.buyerPortion,
          driverCompensation: breakdown.pickupFee + (breakdown.driverMileageNet / 2),
          reason: 'item_rejected'
        }),
      });
      
      if (response.ok) {
        Alert.alert('Payment Processed', 'Buyer charged, driver compensated fairly');
        onPaymentComplete(breakdown);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process rejection payment');
    }
  };

  const handleTipProcessing = async (tipAmount, tipperType) => {
    try {
      const response = await fetch('/api/drivers/process-tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryId: delivery.id,
          tipAmount: tipAmount,
          tipperType: tipperType, // 'buyer' or 'seller'
          driverReceives: tipAmount // 100% to driver
        }),
      });
      
      if (response.ok) {
        Alert.alert(
          'Tip Received!',
          `$${tipAmount.toFixed(2)} tip from ${tipperType}\n100% goes to driver`
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process tip');
    }
  };

  if (!visible) return null;

  const breakdown = calculatePayments();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Payment Manager</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Payment Breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Breakdown</Text>
              
              <View style={styles.breakdownItem}>
                <Text style={styles.itemLabel}>Pickup Fee</Text>
                <Text style={styles.itemValue}>${breakdown.pickupFee.toFixed(2)}</Text>
              </View>
              
              <View style={styles.breakdownItem}>
                <Text style={styles.itemLabel}>Dropoff Fee</Text>
                <Text style={styles.itemValue}>${breakdown.dropoffFee.toFixed(2)}</Text>
              </View>
              
              <View style={styles.breakdownItem}>
                <Text style={styles.itemLabel}>Mileage (≤15 miles @ $0.50/mi)</Text>
                <Text style={styles.itemValue}>${breakdown.mileageFee.toFixed(2)}</Text>
              </View>
              
              {breakdown.overageFee > 0 && (
                <View style={styles.breakdownItem}>
                  <Text style={styles.itemLabel}>Overage Mileage (>15 mi @ $1.00/mi)</Text>
                  <Text style={styles.itemValue}>${breakdown.overageFee.toFixed(2)}</Text>
                </View>
              )}
              
              {breakdown.largeBonusFee > 0 && (
                <View style={styles.breakdownItem}>
                  <Text style={styles.itemLabel}>Large Delivery Bonus</Text>
                  <Text style={styles.itemValue}>${breakdown.largeBonusFee.toFixed(2)}</Text>
                </View>
              )}
              
              <View style={styles.breakdownItem}>
                <Text style={[styles.itemLabel, { color: colors.error }]}>
                  Platform Commission (15% mileage)
                </Text>
                <Text style={[styles.itemValue, { color: colors.error }]}>
                  -${breakdown.platformCommission.toFixed(2)}
                </Text>
              </View>
              
              {delivery.tips > 0 && (
                <View style={styles.breakdownItem}>
                  <Text style={[styles.itemLabel, { color: colors.success }]}>Tips (100%)</Text>
                  <Text style={[styles.itemValue, { color: colors.success }]}>
                    +${delivery.tips.toFixed(2)}
                  </Text>
                </View>
              )}
              
              <View style={[styles.breakdownItem, styles.totalRow]}>
                <Text style={styles.totalLabel}>Driver Total Earnings</Text>
                <Text style={styles.totalValue}>${breakdown.driverTotal.toFixed(2)}</Text>
              </View>
            </View>

            {/* Delivery Cost Split */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Delivery Cost Split</Text>
              
              <View style={styles.breakdownItem}>
                <Text style={styles.itemLabel}>Buyer Portion (50%)</Text>
                <Text style={styles.itemValue}>${breakdown.buyerPortion.toFixed(2)}</Text>
              </View>
              
              <View style={styles.breakdownItem}>
                <Text style={styles.itemLabel}>Seller Portion (50%)</Text>
                <Text style={styles.itemValue}>${breakdown.sellerPortion.toFixed(2)}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionSection}>
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={handlePaymentProcess}
                disabled={loading}
              >
                <Ionicons name="card" size={20} color={colors.white} />
                <Text style={styles.primaryButtonText}>
                  {loading ? 'Processing...' : 'Process Driver Payment'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.warningButton]}
                onPress={handleBuyerRejectionPayment}
              >
                <Ionicons name="return-down-back" size={20} color={colors.white} />
                <Text style={styles.warningButtonText}>Handle Buyer Rejection</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.successButton]}
                onPress={() => handleTipProcessing(5.00, 'buyer')}
              >
                <Ionicons name="cash" size={20} color={colors.white} />
                <Text style={styles.successButtonText}>Process Buyer Tip ($5)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.successButton]}
                onPress={() => handleTipProcessing(3.00, 'seller')}
              >
                <Ionicons name="cash" size={20} color={colors.white} />
                <Text style={styles.successButtonText}>Process Seller Tip ($3)</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    width: '95%',
    maxHeight: '90%',
    maxWidth: 500,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  itemLabel: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  itemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  totalRow: {
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderBottomWidth: 0,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.success,
  },
  actionSection: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  warningButton: {
    backgroundColor: colors.warning,
  },
  warningButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  successButton: {
    backgroundColor: colors.success,
  },
  successButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});