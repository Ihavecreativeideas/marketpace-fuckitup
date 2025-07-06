import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/ui/Button';

const { width, height } = Dimensions.get('window');

interface LandingProps {
  onEnterApp: () => void;
  onShowAuth?: () => void;
}

export default function SimpleLanding({ onEnterApp, onShowAuth }: LandingProps) {
  const features = [
    { icon: 'storefront', title: 'Marketplace', desc: 'Buy & sell locally' },
    { icon: 'car', title: 'Delivery', desc: 'Fast like Uber Eats' },
    { icon: 'people', title: 'Community', desc: 'Connect locally' },
    { icon: 'star', title: 'Pro Features', desc: 'Premium benefits' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#007AFF', '#5856D6']}
        style={styles.hero}
      >
        <View style={styles.heroContent}>
          <Text style={styles.title}>MarketPace</Text>
          <Text style={styles.subtitle}>
            Local Marketplace with Lightning-Fast Delivery
          </Text>
          <Text style={styles.description}>
            Buy, sell, and get everything delivered like Uber Eats
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.featuresSection}>
        <Text style={styles.featuresTitle}>What You Can Do</Text>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <Ionicons name={feature.icon as any} size={32} color="#007AFF" />
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDesc}>{feature.desc}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.authSection}>
          <Text style={styles.authTitle}>Join MarketPace</Text>
          
          <Button
            title="Continue with Replit"
            onPress={() => {
              // This will redirect to the backend auth endpoint
              if (typeof window !== 'undefined') {
                window.location.href = '/api/login';
              }
            }}
            style={[styles.authButton, styles.replitButton]}
          />
          
          <Button
            title="Continue with Google"
            onPress={() => console.log('Google login')}
            style={[styles.authButton, styles.googleButton]}
          />
          
          <Button
            title="Continue with Email"
            onPress={() => onShowAuth && onShowAuth()}
            style={[styles.authButton, styles.emailButton]}
          />
          
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>
          
          <Button
            title="Browse as Guest"
            onPress={onEnterApp}
            style={[styles.authButton, styles.guestButton]}
            variant="secondary"
          />
          
          <Text style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  hero: {
    height: height * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  heroContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
    opacity: 0.9,
  },
  description: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 24,
  },
  featuresSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
    color: '#333',
  },
  featureDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  authSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  authTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  authButton: {
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  replitButton: {
    backgroundColor: '#FF6900',
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  emailButton: {
    backgroundColor: '#007AFF',
  },
  guestButton: {
    borderColor: '#007AFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666',
    fontSize: 14,
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});