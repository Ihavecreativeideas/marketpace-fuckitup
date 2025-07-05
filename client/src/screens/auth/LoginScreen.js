import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';
import { useAuth } from '../../hooks/useAuth';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();

  const handleLogin = () => {
    login();
  };

  const handleGuestMode = () => {
    // Navigate to guest mode or main app
    navigation.navigate('Main');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo and Title */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="storefront" size={80} color={Colors.primary} />
          </View>
          <Text style={styles.title}>MarketPace</Text>
          <Text style={styles.subtitle}>
            Your neighborhood marketplace with delivery
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.featureRow}>
            <Ionicons name="bag-handle" size={24} color={Colors.primary} />
            <Text style={styles.featureText}>Buy & Sell Locally</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="car" size={24} color={Colors.primary} />
            <Text style={styles.featureText}>Fast Delivery Service</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="people" size={24} color={Colors.primary} />
            <Text style={styles.featureText}>Community Hub</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="calendar" size={24} color={Colors.primary} />
            <Text style={styles.featureText}>Rent Anything</Text>
          </View>
        </View>

        {/* Authentication Options */}
        <View style={styles.authOptions}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.guestButton} 
            onPress={handleGuestMode}
          >
            <Text style={styles.guestButtonText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoContainer: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.borderRadius.round,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    fontWeight: '700',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: width * 0.8,
  },
  features: {
    marginBottom: Spacing.xxl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  featureText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginLeft: Spacing.md,
    fontWeight: '500',
  },
  authOptions: {
    marginBottom: Spacing.xl,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    ...Typography.button,
    color: Colors.primary,
  },
  guestButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  guestButtonText: {
    ...Typography.body,
    color: Colors.textTertiary,
    textDecorationLine: 'underline',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  footerText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
