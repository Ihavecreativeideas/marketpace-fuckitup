import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../../src/utils/colors';

interface FuturisticButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  glowEffect?: boolean;
  loading?: boolean;
}

export default function FuturisticButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  glowEffect = true,
  loading = false,
}: FuturisticButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (glowEffect && !disabled) {
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
    }
  }, [glowEffect, disabled]);

  const handlePressIn = () => {
    if (!disabled && !loading) {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          fontSize: 14,
          borderRadius: 8,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 32,
          fontSize: 18,
          borderRadius: 12,
        };
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          fontSize: 16,
          borderRadius: 10,
        };
    }
  };

  const getVariantStyles = () => {
    const baseStyle = getSizeStyles();
    
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: colors.cosmic.gradient.secondary[1],
          borderColor: colors.cosmic.gradient.secondary[2],
          textColor: colors.text,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.primary,
          textColor: colors.primary,
          borderWidth: 2,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          textColor: colors.primary,
        };
      default: // primary
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primaryDark,
          textColor: colors.text,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const renderContent = () => {
    if (variant === 'primary' || variant === 'secondary') {
      return (
        <LinearGradient
          colors={variant === 'primary' ? colors.cosmic.gradient.accent : colors.cosmic.gradient.secondary}
          style={[
            styles.gradient,
            {
              borderRadius: sizeStyles.borderRadius,
              paddingVertical: sizeStyles.paddingVertical,
              paddingHorizontal: sizeStyles.paddingHorizontal,
            }
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={[styles.text, { fontSize: sizeStyles.fontSize, color: variantStyles.textColor }, textStyle]}>
            {loading ? 'Loading...' : title}
          </Text>
        </LinearGradient>
      );
    }

    return (
      <Text style={[styles.text, { fontSize: sizeStyles.fontSize, color: variantStyles.textColor }, textStyle]}>
        {loading ? 'Loading...' : title}
      </Text>
    );
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.button,
          {
            borderRadius: sizeStyles.borderRadius,
            backgroundColor: variant === 'outline' || variant === 'ghost' ? variantStyles.backgroundColor : undefined,
            borderColor: variantStyles.borderColor,
            borderWidth: variantStyles.borderWidth || 1,
            opacity: disabled ? 0.5 : 1,
          },
          variant !== 'primary' && variant !== 'secondary' && {
            paddingVertical: sizeStyles.paddingVertical,
            paddingHorizontal: sizeStyles.paddingHorizontal,
          }
        ]}
      >
        {renderContent()}
        
        {/* Glow effect */}
        {glowEffect && !disabled && (
          <Animated.View
            style={[
              styles.glow,
              {
                opacity: glowOpacity,
                borderRadius: sizeStyles.borderRadius + 5,
                shadowColor: colors.cosmic.neon.purple,
              }
            ]}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  glow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 3,
  },
});