import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../../src/utils/colors';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: 'light' | 'medium' | 'dark';
  borderRadius?: number;
  padding?: number;
  margin?: number;
}

export default function GlassCard({ 
  children, 
  style, 
  intensity = 'medium',
  borderRadius = 16,
  padding = 20,
  margin = 0
}: GlassCardProps) {
  
  const getIntensityStyle = () => {
    switch (intensity) {
      case 'light':
        return {
          backgroundColor: colors.cosmic.glass.light,
          borderColor: colors.cosmic.glass.border,
        };
      case 'dark':
        return {
          backgroundColor: colors.cosmic.glass.dark,
          borderColor: colors.border,
        };
      default:
        return {
          backgroundColor: colors.surface,
          borderColor: colors.cosmic.glass.border,
        };
    }
  };

  return (
    <View 
      style={[
        styles.container,
        {
          borderRadius,
          padding,
          margin,
          ...getIntensityStyle(),
        },
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
});