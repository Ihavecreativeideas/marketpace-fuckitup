import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/ui/Button';

const { width, height } = Dimensions.get('window');

interface LandingProps {
  onEnterApp: () => void;
}

export default function SimpleLanding({ onEnterApp }: LandingProps) {
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
        
        <View style={styles.buttonContainer}>
          <Button
            title="Enter MarketPace"
            onPress={onEnterApp}
            style={styles.enterButton}
          />
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
    height: height * 0.4,
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
    flex: 1,
    padding: 20,
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
    marginBottom: 40,
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
  buttonContainer: {
    marginTop: 'auto',
    paddingBottom: 20,
  },
  enterButton: {
    paddingVertical: 16,
    borderRadius: 12,
  },
});