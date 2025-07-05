import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../components/ui/Button';

const { width, height } = Dimensions.get('window');

export default function Landing() {
  const handleLogin = () => {
    // This will redirect to the backend auth endpoint
    window.location.href = '/api/login';
  };

  const features = [
    {
      icon: 'storefront',
      title: 'Marketplace',
      description: 'Buy and sell items locally with ease',
    },
    {
      icon: 'car',
      title: 'Delivery',
      description: 'Fast delivery service like Uber Eats',
    },
    {
      icon: 'people',
      title: 'Community',
      description: 'Connect with your local community',
    },
    {
      icon: 'star',
      title: 'Pro Features',
      description: 'Unlock premium features and benefits',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ImageBackground
        source={{
          uri: 'https://pixabay.com/get/g4b02c701fb221a6fc0ba9a0beecefcd9714f81f5068058781d749959c3f2dbdd3bae3a8889ab04d8cefde57a2755b71e4f2be6f007898c6fa0b733c805099de4_1280.jpg',
        }}
        style={styles.heroSection}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
          style={styles.heroOverlay}
        >
          <View style={styles.heroContent}>
            <Text style={styles.logo}>MarketPace</Text>
            <Text style={styles.tagline}>
              Your Local Marketplace with Delivery
            </Text>
            <Text style={styles.subtitle}>
              Buy, Sell, and Get Everything Delivered
            </Text>
            
            <View style={styles.buttonContainer}>
              <Button
                title="Get Started"
                onPress={handleLogin}
                size="large"
                style={styles.primaryButton}
              />
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Learn More</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Why Choose MarketPace?</Text>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Ionicons name={feature.icon as any} size={32} color="#007AFF" />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.ctaSection}>
        <ImageBackground
          source={{
            uri: 'https://pixabay.com/get/g15761b0fd476019e127f67b58c8a496122c3770247a5b13c96e6eed1ad0d9c8bf048ccbb1660a6cb5d63eb7d3277dd4d04c6ed5127690cbbd2810cf8fa156f16_1280.jpg',
          }}
          style={styles.ctaBackground}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0,122,255,0.8)', 'rgba(0,122,255,0.9)']}
            style={styles.ctaOverlay}
          >
            <Text style={styles.ctaTitle}>Ready to Start?</Text>
            <Text style={styles.ctaSubtitle}>
              Join thousands of users already using MarketPace
            </Text>
            <Button
              title="Sign Up Now"
              onPress={handleLogin}
              size="large"
              variant="secondary"
              style={styles.ctaButton}
            />
          </LinearGradient>
        </ImageBackground>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 MarketPace. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heroSection: {
    height: height * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  tagline: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    width: 200,
    marginBottom: 15,
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  featuresSection: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,122,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  featureDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  ctaSection: {
    height: 250,
  },
  ctaBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
  },
  ctaButton: {
    width: 200,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#333',
  },
  footerText: {
    color: '#999',
    fontSize: 12,
  },
});
