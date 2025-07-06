import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../../src/utils/colors';

interface FuturisticLogoProps {
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  showTagline?: boolean;
}

export default function FuturisticLogo({ 
  size = 'medium', 
  animated = true,
  showTagline = false 
}: FuturisticLogoProps) {
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated) {
      // Glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 3000,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [animated]);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          fontSize: 24,
          iconSize: 30,
          containerPadding: 15,
        };
      case 'large':
        return {
          fontSize: 42,
          iconSize: 50,
          containerPadding: 30,
        };
      default:
        return {
          fontSize: 32,
          iconSize: 40,
          containerPadding: 20,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <Animated.View 
      style={[
        styles.container,
        { padding: sizeStyles.containerPadding },
        animated && { transform: [{ scale: pulseAnim }] }
      ]}
    >
      {/* Logo icon/symbol */}
      <View style={styles.logoContainer}>
        {/* Futuristic diamond/gem icon */}
        <View style={[styles.logoIcon, { width: sizeStyles.iconSize, height: sizeStyles.iconSize }]}>
          <LinearGradient
            colors={colors.cosmic.gradient.accent}
            style={styles.logoGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          
          {/* Animated glow effect */}
          {animated && (
            <Animated.View
              style={[
                styles.logoGlow,
                {
                  opacity: glowOpacity,
                  shadowRadius: 20,
                  shadowColor: colors.cosmic.neon.purple,
                }
              ]}
            />
          )}
          
          {/* Inner highlight */}
          <View style={styles.logoHighlight} />
        </View>
      </View>

      {/* Text logo */}
      <View style={styles.textContainer}>
        <Text style={[styles.logoText, { fontSize: sizeStyles.fontSize }]}>
          <Text style={styles.marketText}>Market</Text>
          <Text style={styles.paceText}>Pace</Text>
        </Text>
        
        {showTagline && (
          <Text style={styles.tagline}>
            Delivering Opportunities. Building Local Power.
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 10,
    position: 'relative',
  },
  logoIcon: {
    borderRadius: 8,
    position: 'relative',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    elevation: 10,
  },
  logoGradient: {
    flex: 1,
    borderRadius: 8,
  },
  logoGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 18,
    backgroundColor: colors.cosmic.neon.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    elevation: 5,
  },
  logoHighlight: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: '60%',
    bottom: '60%',
    backgroundColor: colors.cosmic.glass.light,
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  textContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: colors.cosmic.neon.purple,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    elevation: 5,
  },
  marketText: {
    color: colors.text,
  },
  paceText: {
    color: colors.cosmic.neon.purple,
  },
  tagline: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
  },
});