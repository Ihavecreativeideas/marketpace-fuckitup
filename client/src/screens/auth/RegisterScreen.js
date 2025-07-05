import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';
import { useAuth } from '../../hooks/useAuth';
import Header from '../../components/common/Header';

export default function RegisterScreen({ navigation }) {
  const { login } = useAuth();
  const [selectedType, setSelectedType] = useState('buyer');

  const userTypes = [
    {
      id: 'buyer',
      title: 'Buyer',
      description: 'Browse and purchase items from local sellers',
      icon: 'bag-handle',
      color: Colors.primary,
    },
    {
      id: 'seller',
      title: 'Seller',
      description: 'Sell your items to the community',
      icon: 'storefront',
      color: Colors.secondary,
    },
    {
      id: 'driver',
      title: 'Driver',
      description: 'Deliver items and earn money',
      icon: 'car',
      color: Colors.success,
    },
    {
      id: 'business',
      title: 'Business',
      description: 'Run your business on MarketPace',
      icon: 'business',
      color: Colors.warning,
    },
  ];

  const handleRegister = () => {
    // In a real app, you would create account with selected type
    // For now, redirect to login
    login();
  };

  const handleSocialLogin = (provider) => {
    Alert.alert(
      'Social Login',
      `Sign up with ${provider}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => login() }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Create Account"
        showBackButton
        navigation={navigation}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Join MarketPace</Text>
          <Text style={styles.subtitle}>
            Choose how you want to use MarketPace
          </Text>
        </View>

        {/* User Type Selection */}
        <View style={styles.userTypes}>
          {userTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.userTypeCard,
                selectedType === type.id && styles.selectedCard
              ]}
              onPress={() => setSelectedType(type.id)}
            >
              <View style={[styles.iconContainer, { backgroundColor: type.color + '20' }]}>
                <Ionicons name={type.icon} size={32} color={type.color} />
              </View>
              
              <View style={styles.typeContent}>
                <Text style={styles.typeTitle}>{type.title}</Text>
                <Text style={styles.typeDescription}>{type.description}</Text>
              </View>

              {selectedType === type.id && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Social Login Options */}
        <View style={styles.socialLogin}>
          <Text style={styles.socialTitle}>Sign up with</Text>
          
          <View style={styles.socialButtons}>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleSocialLogin('Google')}
            >
              <Ionicons name="logo-google" size={24} color={Colors.error} />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleSocialLogin('Facebook')}
            >
              <Ionicons name="logo-facebook" size={24} color={Colors.primary} />
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => handleSocialLogin('Apple')}
            >
              <Ionicons name="logo-apple" size={24} color={Colors.black} />
              <Text style={styles.socialButtonText}>Apple</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Email Registration */}
        <View style={styles.emailSection}>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.emailButton} onPress={handleRegister}>
            <Ionicons name="mail" size={24} color={Colors.primary} />
            <Text style={styles.emailButtonText}>Continue with Email</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerText}>
              Already have an account? <Text style={styles.footerLink}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  userTypes: {
    marginBottom: Spacing.xl,
  },
  userTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.lightGray,
  },
  selectedCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '05',
  },
  iconContainer: {
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.lg,
    marginRight: Spacing.md,
  },
  typeContent: {
    flex: 1,
  },
  typeTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  typeDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  checkmark: {
    marginLeft: Spacing.sm,
  },
  socialLogin: {
    marginBottom: Spacing.xl,
  },
  socialTitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    marginHorizontal: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  socialButtonText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
    fontSize: 14,
  },
  emailSection: {
    marginBottom: Spacing.xl,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.lightGray,
  },
  dividerText: {
    ...Typography.body,
    color: Colors.textTertiary,
    marginHorizontal: Spacing.md,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  emailButtonText: {
    ...Typography.button,
    color: Colors.primary,
    marginLeft: Spacing.sm,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: Spacing.xl,
  },
  footerText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  footerLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
