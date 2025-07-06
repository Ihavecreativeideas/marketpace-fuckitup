import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/ui/Button';

const { width, height } = Dimensions.get('window');

interface LandingProps {
  onEnterApp: () => void;
  onShowAuth?: () => void;
}

export default function FullLanding({ onEnterApp, onShowAuth }: LandingProps) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <LinearGradient
        colors={['#007AFF', '#5856D6']}
        style={styles.hero}
      >
        <View style={styles.heroContent}>
          <Text style={styles.title}>MarketPace</Text>
          <Text style={styles.subtitle}>
            Your Local Marketplace with Lightning-Fast Delivery
          </Text>
          <Text style={styles.description}>
            Buy, sell, and get everything delivered like Uber Eats
          </Text>
        </View>
      </LinearGradient>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>What You Can Do</Text>
        <View style={styles.featuresGrid}>
          <View style={styles.featureCard}>
            <Ionicons name="storefront" size={40} color="#007AFF" />
            <Text style={styles.featureTitle}>Marketplace</Text>
            <Text style={styles.featureDesc}>Buy & sell items locally with ease</Text>
          </View>
          <View style={styles.featureCard}>
            <Ionicons name="car" size={40} color="#007AFF" />
            <Text style={styles.featureTitle}>Fast Delivery</Text>
            <Text style={styles.featureDesc}>Get items delivered like Uber Eats</Text>
          </View>
          <View style={styles.featureCard}>
            <Ionicons name="people" size={40} color="#007AFF" />
            <Text style={styles.featureTitle}>Community</Text>
            <Text style={styles.featureDesc}>Connect with your local area</Text>
          </View>
          <View style={styles.featureCard}>
            <Ionicons name="business" size={40} color="#007AFF" />
            <Text style={styles.featureTitle}>Business Integration</Text>
            <Text style={styles.featureDesc}>Connect your website & showcase products</Text>
          </View>
          <View style={styles.featureCard}>
            <Ionicons name="musical-notes" size={40} color="#007AFF" />
            <Text style={styles.featureTitle}>Entertainment Profiles</Text>
            <Text style={styles.featureDesc}>Integrate with Bandzoogle & sell music/merch</Text>
          </View>
          <View style={styles.featureCard}>
            <Ionicons name="share-social" size={40} color="#007AFF" />
            <Text style={styles.featureTitle}>Social Media Integration</Text>
            <Text style={styles.featureDesc}>Connect Facebook, Instagram & more</Text>
          </View>
        </View>
      </View>

      {/* Business & Entertainment Integration */}
      <View style={styles.businessSection}>
        <Text style={styles.sectionTitle}>Business & Entertainment Integration</Text>
        
        <View style={styles.integrationCard}>
          <Ionicons name="business-outline" size={32} color="#007AFF" />
          <Text style={styles.integrationTitle}>Business Profiles</Text>
          <Text style={styles.integrationDesc}>
            Connect your personal website to showcase your shop's products and prices. 
            Sync inventory and automatically update pricing from your existing web store.
          </Text>
          <View style={styles.platformsList}>
            <Text style={styles.platformItem}>• Shopify Integration</Text>
            <Text style={styles.platformItem}>• WooCommerce Sync</Text>
            <Text style={styles.platformItem}>• Custom Website API</Text>
          </View>
        </View>

        <View style={styles.integrationCard}>
          <Ionicons name="musical-notes-outline" size={32} color="#007AFF" />
          <Text style={styles.integrationTitle}>Entertainment Profiles</Text>
          <Text style={styles.integrationDesc}>
            Link with Bandzoogle and other music platforms to sell your merch and music directly. 
            Fans can discover and purchase from your complete catalog.
          </Text>
          <View style={styles.platformsList}>
            <Text style={styles.platformItem}>• Bandzoogle Integration</Text>
            <Text style={styles.platformItem}>• Bandcamp Sync</Text>
            <Text style={styles.platformItem}>• SoundCloud Connect</Text>
          </View>
        </View>

        <View style={styles.integrationCard}>
          <Ionicons name="share-social-outline" size={32} color="#007AFF" />
          <Text style={styles.integrationTitle}>Social Media Integration</Text>
          <Text style={styles.integrationDesc}>
            Cross-post your listings to Facebook Marketplace, Instagram Shopping, and more. 
            Manage everything from one dashboard.
          </Text>
          <View style={styles.platformsList}>
            <Text style={styles.platformItem}>• Facebook Marketplace</Text>
            <Text style={styles.platformItem}>• Instagram Shopping</Text>
            <Text style={styles.platformItem}>• TikTok Shop</Text>
          </View>
        </View>
      </View>

      {/* How It Works Section */}
      <View style={styles.howItWorksSection}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.stepsList}>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Browse or List</Text>
              <Text style={styles.stepDesc}>Find items you need or list items to sell</Text>
            </View>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Order & Pay</Text>
              <Text style={styles.stepDesc}>Secure checkout with multiple payment options</Text>
            </View>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Fast Delivery</Text>
              <Text style={styles.stepDesc}>Get your items delivered quickly by local drivers</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Authentication Section */}
      <View style={styles.authSection}>
        <Text style={styles.authTitle}>Join MarketPace Today</Text>
        <Text style={styles.authSubtitle}>Connect with your community and grow your business</Text>
        
        <View style={styles.authButtons}>
          <Button
            title="🔗 Continue with Replit"
            onPress={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/api/login';
              }
            }}
            style={[styles.authButton, styles.replitButton]}
          />
          
          <Button
            title="🔍 Continue with Google"
            onPress={() => console.log('Google login')}
            style={[styles.authButton, styles.googleButton]}
          />
          
          <Button
            title="📘 Continue with Facebook"
            onPress={() => console.log('Facebook login')}
            style={[styles.authButton, styles.facebookButton]}
          />
          
          <Button
            title="📧 Continue with Email"
            onPress={() => onShowAuth && onShowAuth()}
            style={[styles.authButton, styles.emailButton]}
          />
          
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>
          
          <Button
            title="👤 Browse as Guest"
            onPress={onEnterApp}
            style={[styles.authButton, styles.guestButton]}
            variant="secondary"
          />
        </View>
        
        <Text style={styles.termsText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
      
      {/* Extra spacing at bottom */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
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
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  featureCard: {
    width: '47%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 140,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  businessSection: {
    padding: 20,
    backgroundColor: '#fff',
  },
  integrationCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  integrationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 8,
  },
  integrationDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  platformsList: {
    gap: 4,
  },
  platformItem: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
  },
  howItWorksSection: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  stepsList: {
    gap: 20,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  authSection: {
    padding: 20,
    backgroundColor: '#fff',
  },
  authTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  authSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  authButtons: {
    gap: 12,
  },
  authButton: {
    paddingVertical: 16,
    borderRadius: 12,
  },
  replitButton: {
    backgroundColor: '#FF6900',
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  emailButton: {
    backgroundColor: '#007AFF',
  },
  guestButton: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
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
    marginTop: 20,
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 40,
  },
});