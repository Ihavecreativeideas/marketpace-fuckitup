import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../../src/utils/colors';

interface ScrollableFuturisticBackgroundProps {
  children: React.ReactNode;
}

export default function ScrollableFuturisticBackground({ children }: ScrollableFuturisticBackgroundProps) {
  return (
    <View style={styles.container}>
      {/* Main gradient background */}
      <LinearGradient
        colors={colors.cosmic.gradient.primary}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Secondary gradient overlay */}
      <LinearGradient
        colors={[
          'transparent',
          colors.cosmic.gradient.secondary[1] + '20',
          'transparent',
        ]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />

      {/* Static particles for better performance */}
      <View style={[styles.particle, { top: '10%', left: '20%' }]} />
      <View style={[styles.particle, { top: '30%', right: '15%' }]} />
      <View style={[styles.particle, { top: '60%', left: '10%' }]} />
      <View style={[styles.particle, { top: '80%', right: '25%' }]} />
      <View style={[styles.particle, { top: '45%', left: '70%' }]} />

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.cosmic.particles.primary,
    shadowColor: colors.cosmic.particles.glow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
});