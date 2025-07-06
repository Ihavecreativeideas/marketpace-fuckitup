import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../../src/utils/colors';

const { width, height } = Dimensions.get('window');

interface Particle {
  id: string;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  speed: number;
  size: number;
}

interface FuturisticBackgroundProps {
  children: React.ReactNode;
  particleCount?: number;
  glowIntensity?: 'light' | 'medium' | 'strong';
}

export default function FuturisticBackground({ 
  children, 
  particleCount = 25,
  glowIntensity = 'medium'
}: FuturisticBackgroundProps) {
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    // Create particles
    particles.current = Array.from({ length: particleCount }, (_, i) => ({
      id: `particle-${i}`,
      x: new Animated.Value(Math.random() * width),
      y: new Animated.Value(Math.random() * height),
      opacity: new Animated.Value(Math.random() * 0.8 + 0.2),
      scale: new Animated.Value(Math.random() * 0.5 + 0.5),
      speed: Math.random() * 2 + 0.5,
      size: Math.random() * 4 + 2,
    }));

    // Animate particles
    const animateParticles = () => {
      particles.current.forEach((particle) => {
        // Float animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(particle.y, {
              toValue: particle.y._value - 20,
              duration: 3000 + Math.random() * 2000,
              useNativeDriver: false,
            }),
            Animated.timing(particle.y, {
              toValue: particle.y._value + 40,
              duration: 3000 + Math.random() * 2000,
              useNativeDriver: false,
            }),
          ])
        ).start();

        // Opacity pulse
        Animated.loop(
          Animated.sequence([
            Animated.timing(particle.opacity, {
              toValue: 0.2,
              duration: 2000 + Math.random() * 1000,
              useNativeDriver: false,
            }),
            Animated.timing(particle.opacity, {
              toValue: 0.8,
              duration: 2000 + Math.random() * 1000,
              useNativeDriver: false,
            }),
          ])
        ).start();

        // Scale pulse
        Animated.loop(
          Animated.sequence([
            Animated.timing(particle.scale, {
              toValue: 0.5,
              duration: 1500 + Math.random() * 1000,
              useNativeDriver: false,
            }),
            Animated.timing(particle.scale, {
              toValue: 1.2,
              duration: 1500 + Math.random() * 1000,
              useNativeDriver: false,
            }),
          ])
        ).start();
      });
    };

    animateParticles();
  }, [particleCount]);

  const getGlowStyle = () => {
    switch (glowIntensity) {
      case 'light':
        return { shadowOpacity: 0.3, shadowRadius: 10 };
      case 'strong':
        return { shadowOpacity: 0.8, shadowRadius: 25 };
      default:
        return { shadowOpacity: 0.5, shadowRadius: 15 };
    }
  };

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
          colors.cosmic.gradient.secondary[1] + '40',
          'transparent',
        ]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />

      {/* Floating particles */}
      {particles.current.map((particle) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              left: particle.x,
              top: particle.y,
              opacity: particle.opacity,
              transform: [{ scale: particle.scale }],
              width: particle.size,
              height: particle.size,
              borderRadius: particle.size / 2,
              backgroundColor: colors.cosmic.particles.primary,
              shadowColor: colors.cosmic.particles.glow,
              ...getGlowStyle(),
            },
          ]}
        />
      ))}

      {/* Glass morphism overlay */}
      <View style={styles.glassOverlay} />

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
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.cosmic.glass.medium,
    backdropFilter: 'blur(20px)', // Note: This won't work on React Native, but kept for web compatibility
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
});