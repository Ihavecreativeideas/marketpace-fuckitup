import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { colors } from '../../utils/colors';

const { width, height } = Dimensions.get('window');

export default function LoadingSpinner({
  visible = false,
  text = 'Loading...',
  size = 'large',
  color = colors.primary,
  overlay = true,
  style,
  textStyle,
}) {
  if (overlay) {
    return (
      <Modal
        transparent={true}
        animationType="fade"
        visible={visible}
        onRequestClose={() => {}}
      >
        <View style={styles.overlayContainer}>
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size={size} color={color} />
            {text && (
              <Text style={[styles.text, textStyle]}>{text}</Text>
            )}
          </View>
        </View>
      </Modal>
    );
  }

  if (!visible) return null;

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text style={[styles.text, textStyle]}>{text}</Text>
      )}
    </View>
  );
}

// Simple inline spinner without overlay
export function InlineSpinner({
  size = 'small',
  color = colors.primary,
  text,
  style,
  textStyle,
}) {
  return (
    <View style={[styles.inlineContainer, style]}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text style={[styles.inlineText, textStyle]}>{text}</Text>
      )}
    </View>
  );
}

// Full screen loading component
export function FullScreenLoader({
  visible = false,
  text = 'Loading...',
  backgroundColor = colors.background,
}) {
  if (!visible) return null;

  return (
    <View style={[styles.fullScreenContainer, { backgroundColor }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.fullScreenText}>{text}</Text>
    </View>
  );
}

// Refresh loading component
export function RefreshLoader({
  visible = false,
  style,
}) {
  if (!visible) return null;

  return (
    <View style={[styles.refreshContainer, style]}>
      <ActivityIndicator size="small" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  spinnerContainer: {
    backgroundColor: colors.white,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  inlineText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
  },
  fullScreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  fullScreenText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  refreshContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
});
