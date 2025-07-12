import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils/colors';

export default function DeliveryMethodSelector({ delivery, visible, onClose, onMethodSelected }) {
  const [selectedMethod, setSelectedMethod] = useState(null);

  const deliveryMethods = [
    {
      id: 'marketpace_delivery',
      title: 'MarketPace Delivery',
      description: 'Standard driver delivery with full tracking',
      icon: 'car',
      fee: 'Split 50/50 buyer/seller',
      features: [
        'Real-time tracking',
        'Photo confirmation',
        'Driver communication',
        'Insurance coverage'
      ]
    },
    {
      id: 'self_pickup',
      title: 'Self Pickup',
      description: 'Buyer picks up directly from seller',
      icon: 'walk',
      fee: 'Free',
      features: [
        'No delivery fees',
        'Direct seller contact',
        'Flexible timing',
        'Immediate availability'
      ]
    },
    {
      id: 'counter_offer',
      title: 'Counter Offer Available',
      description: 'Negotiate price or delivery terms',
      icon: 'chatbubbles',
      fee: 'Negotiable',
      features: [
        'Price negotiation',
        'Custom delivery terms',
        'Direct communication',
        'Flexible arrangements'
      ]
    },
    {
      id: 'same_day_delivery',
      title: 'Same Day Delivery',
      description: 'Express delivery within 4 hours',
      icon: 'flash',
      fee: '+$10 express fee',
      features: [
        'Priority routing',
        '4-hour delivery window',
        'Real-time updates',
        'Express handling'
      ]
    },
    {
      id: 'scheduled_delivery',
      title: 'Scheduled Delivery',
      description: 'Choose specific delivery time',
      icon: 'calendar',
      fee: 'Standard rate',
      features: [
        'Pick your time slot',
        '2-hour delivery window',
        'Advance planning',
        'Guaranteed timing'
      ]
    },
    {
      id: 'contactless_delivery',
      title: 'Contactless Delivery',
      description: 'No-contact dropoff with photo proof',
      icon: 'shield-checkmark',
      fee: 'Standard rate',
      features: [
        'Safe dropoff',
        'Photo verification',
        'No direct contact',
        'Secure delivery'
      ]
    }
  ];

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
  };

  const confirmSelection = () => {
    if (!selectedMethod) {
      Alert.alert('Selection Required', 'Please select a delivery method');
      return;
    }

    Alert.alert(
      'Confirm Delivery Method',
      `Selected: ${selectedMethod.title}\nFee: ${selectedMethod.fee}\n\nProceed with this delivery method?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            onMethodSelected(selectedMethod);
            onClose();
          }
        }
      ]
    );
  };

  const renderMethodCard = (method) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.methodCard,
        selectedMethod?.id === method.id && styles.selectedCard
      ]}
      onPress={() => handleMethodSelect(method)}
    >
      <View style={styles.methodHeader}>
        <View style={styles.methodIcon}>
          <Ionicons 
            name={method.icon} 
            size={24} 
            color={selectedMethod?.id === method.id ? colors.white : colors.primary} 
          />
        </View>
        <View style={styles.methodInfo}>
          <Text style={[
            styles.methodTitle,
            selectedMethod?.id === method.id && { color: colors.white }
          ]}>
            {method.title}
          </Text>
          <Text style={[
            styles.methodDescription,
            selectedMethod?.id === method.id && { color: 'rgba(255,255,255,0.8)' }
          ]}>
            {method.description}
          </Text>
        </View>
        <View style={styles.methodFee}>
          <Text style={[
            styles.feeText,
            selectedMethod?.id === method.id && { color: colors.white }
          ]}>
            {method.fee}
          </Text>
        </View>
      </View>

      <View style={styles.featuresList}>
        {method.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Ionicons 
              name="checkmark" 
              size={12} 
              color={selectedMethod?.id === method.id ? colors.white : colors.success} 
            />
            <Text style={[
              styles.featureText,
              selectedMethod?.id === method.id && { color: 'rgba(255,255,255,0.9)' }
            ]}>
              {feature}
            </Text>
          </View>
        ))}
      </View>

      {selectedMethod?.id === method.id && (
        <View style={styles.selectedIndicator}>
          <Ionicons name="checkmark-circle" size={20} color={colors.white} />
          <Text style={styles.selectedText}>Selected</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose Delivery Method</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.methodsContainer}>
            <Text style={styles.subtitle}>
              Select the best delivery option for this order
            </Text>
            
            {deliveryMethods.map(renderMethodCard)}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                !selectedMethod && styles.disabledButton
              ]}
              onPress={confirmSelection}
              disabled={!selectedMethod}
            >
              <Text style={[
                styles.confirmButtonText,
                !selectedMethod && styles.disabledText
              ]}>
                Confirm Delivery Method
              </Text>
            </TouchableOpacity>
          </View>
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
  subtitle: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 20,
  },
  methodsContainer: {
    flex: 1,
    padding: 20,
  },
  methodCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 12,
    color: colors.gray,
  },
  methodFee: {
    alignItems: 'flex-end',
  },
  feeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  featuresList: {
    marginLeft: 52,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 6,
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  selectedText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: colors.lightGray,
  },
  disabledText: {
    color: colors.gray,
  },
});