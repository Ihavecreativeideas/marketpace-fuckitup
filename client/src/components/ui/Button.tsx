import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle = styles.button;
    const sizeStyle = styles[`${size}Button` as keyof typeof styles] as ViewStyle;
    const variantStyle = styles[`${variant}Button` as keyof typeof styles] as ViewStyle;
    
    return {
      ...baseStyle,
      ...sizeStyle,
      ...variantStyle,
      ...(disabled && styles.disabledButton),
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle = styles.buttonText;
    const sizeStyle = styles[`${size}Text` as keyof typeof styles] as TextStyle;
    const variantStyle = styles[`${variant}Text` as keyof typeof styles] as TextStyle;
    
    return {
      ...baseStyle,
      ...sizeStyle,
      ...variantStyle,
      ...(disabled && styles.disabledText),
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' ? '#007AFF' : '#fff'} 
          size="small" 
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  
  // Size styles
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 44,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 52,
  },

  // Variant styles
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },

  // Disabled styles
  disabledButton: {
    backgroundColor: '#e1e8ed',
    borderColor: '#e1e8ed',
  },

  // Text styles
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Size text styles
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },

  // Variant text styles
  primaryText: {
    color: '#fff',
  },
  outlineText: {
    color: '#007AFF',
  },
  secondaryText: {
    color: '#333',
  },

  // Disabled text
  disabledText: {
    color: '#999',
  },
});