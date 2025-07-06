import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Badge({ label, variant = 'default', style, textStyle }: BadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return { backgroundColor: '#4CAF50', color: '#fff' };
      case 'warning':
        return { backgroundColor: '#FF9800', color: '#fff' };
      case 'error':
        return { backgroundColor: '#F44336', color: '#fff' };
      case 'info':
        return { backgroundColor: '#2196F3', color: '#fff' };
      default:
        return { backgroundColor: '#f0f0f0', color: '#333' };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View style={[styles.badge, { backgroundColor: variantStyles.backgroundColor }, style]}>
      <Text style={[styles.badgeText, { color: variantStyles.color }, textStyle]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});