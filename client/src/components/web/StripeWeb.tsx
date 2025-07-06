import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Web-safe fallback components for Stripe React Native
export function StripeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useStripe() {
  return {
    confirmPayment: () => Promise.resolve({ error: null }),
    createPaymentMethod: () => Promise.resolve({ error: null }),
  };
}

export function CardField() {
  return (
    <View style={styles.cardField}>
      <Text style={styles.placeholder}>Payment form (web version coming soon)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardField: {
    height: 50,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  placeholder: {
    color: '#666',
    fontSize: 14,
  },
});