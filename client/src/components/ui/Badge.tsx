import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface BadgeProps {
  text: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Badge({
  text,
  variant = 'default',
  size = 'medium',
  style,
  textStyle,
}: BadgeProps) {
  return (
    <View style={[styles.badge, styles[variant], styles[size], style]}>
      <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`], textStyle]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  default: {
    backgroundColor: '#f0f0f0',
  },
  success: {
    backgroundColor: '#4CAF50',
  },
  warning: {
    backgroundColor: '#FF9800',
  },
  error: {
    backgroundColor: '#F44336',
  },
  info: {
    backgroundColor: '#2196F3',
  },
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  medium: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  large: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  defaultText: {
    color: '#333',
  },
  successText: {
    color: 'white',
  },
  warningText: {
    color: 'white',
  },
  errorText: {
    color: 'white',
  },
  infoText: {
    color: 'white',
  },
  smallText: {
    fontSize: 10,
  },
  mediumText: {
    fontSize: 12,
  },
  largeText: {
    fontSize: 14,
  },
});
