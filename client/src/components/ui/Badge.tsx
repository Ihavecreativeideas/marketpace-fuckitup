import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface BadgeProps {
  text: string;
  variant?: 'success' | 'warning' | 'error' | 'info';
  style?: ViewStyle;
}

export default function Badge({ text, variant = 'info', style }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[`${variant}Badge`], style]}>
      <Text style={[styles.badgeText, styles[`${variant}Text`]]}>{text}</Text>
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
    textTransform: 'uppercase',
  },
  
  // Variant styles
  successBadge: {
    backgroundColor: '#e8f5e8',
  },
  warningBadge: {
    backgroundColor: '#fff3e0',
  },
  errorBadge: {
    backgroundColor: '#ffebee',
  },
  infoBadge: {
    backgroundColor: '#e3f2fd',
  },
  
  // Text styles
  successText: {
    color: '#4CAF50',
  },
  warningText: {
    color: '#FF9800',
  },
  errorText: {
    color: '#F44336',
  },
  infoText: {
    color: '#2196F3',
  },
});