import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Subscription {
  id: number;
  tier: 'basic' | 'pro';
  status: string;
  monthlyFee: string;
  isEarlySupporter: boolean;
  features: string[];
  currentPeriodEnd?: string;
}

export const SubscriptionCard: React.FC = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/revenue/subscription', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleUpgradeToPro = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would integrate with Stripe
      const mockSubscriptionId = `sub_mock_${Date.now()}`;
      const mockCustomerId = `cus_mock_${Date.now()}`;
      
      const response = await fetch('/api/revenue/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          stripeSubscriptionId: mockSubscriptionId,
          stripeCustomerId: mockCustomerId
        })
      });

      if (response.ok) {
        const result = await response.json();
        Alert.alert('Success!', result.message || 'Successfully upgraded to Pro!');
        fetchSubscription();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.error || 'Failed to upgrade subscription');
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      Alert.alert('Error', 'Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!subscription) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading subscription...</Text>
      </View>
    );
  }

  const isBasic = subscription.tier === 'basic';
  const isPro = subscription.tier === 'pro';

  return (
    <View style={styles.container}>
      {/* Current Plan Card */}
      <LinearGradient
        colors={isPro ? ['#f093fb', '#f5576c'] : ['#4facfe', '#00f2fe']}
        style={styles.planCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.planInfo}>
            <Text style={styles.planTitle}>
              {isPro ? 'MarketPlace Pro' : 'MarketPlace Basic'}
            </Text>
            <Text style={styles.planPrice}>
              {isPro ? '$3.99/month' : 'Free'}
            </Text>
            {subscription.isEarlySupporter && (
              <View style={styles.earlyBadge}>
                <Text style={styles.earlyBadgeText}>⭐ Early Supporter</Text>
              </View>
            )}
          </View>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              {subscription.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {subscription.currentPeriodEnd && (
          <Text style={styles.renewalText}>
            Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
          </Text>
        )}
      </LinearGradient>

      {/* Features Comparison */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>
          {isPro ? 'Your Pro Features' : 'What You Get'}
        </Text>
        
        <View style={styles.featuresGrid}>
          {subscription.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureIcon}>✅</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Upgrade Section (only for Basic users) */}
      {isBasic && (
        <View style={styles.upgradeSection}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.upgradeCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
            <Text style={styles.upgradeSubtitle}>
              Get business tools, dual profiles, analytics, and more!
            </Text>
            
            <View style={styles.proFeatures}>
              {[
                'Dual profiles (personal + business)',
                'Business analytics dashboard',
                'Livestream capabilities',
                'Product sync and S&H tools',
                'Website integration',
                'AI assistant for content',
                'Priority customer support'
              ].map((feature, index) => (
                <View key={index} style={styles.proFeatureItem}>
                  <Text style={styles.proFeatureIcon}>⭐</Text>
                  <Text style={styles.proFeatureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgradeToPro}
              disabled={isLoading}
            >
              <Text style={styles.upgradeButtonText}>
                {isLoading ? 'Processing...' : 'Upgrade for $3.99/month'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}

      {/* Pro User Benefits */}
      {isPro && (
        <View style={styles.proSection}>
          <LinearGradient
            colors={['#f093fb', '#f5576c']}
            style={styles.proBenefitsCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.proBenefitsTitle}>🎉 You're a Pro!</Text>
            <Text style={styles.proBenefitsText}>
              Thank you for supporting local commerce! You have access to all business tools,
              analytics, and premium features to help grow your business in the community.
            </Text>
            
            {subscription.isEarlySupporter && (
              <View style={styles.earlySupporter}>
                <Text style={styles.earlySupporterText}>
                  🌟 As an early supporter, you get lifetime Pro benefits and a special badge
                  throughout the MarketPlace platform!
                </Text>
              </View>
            )}
          </LinearGradient>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  planCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  planPrice: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    opacity: 0.9,
  },
  earlyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  earlyBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  renewalText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  featuresSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  featuresGrid: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  upgradeSection: {
    marginBottom: 20,
  },
  upgradeCard: {
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  upgradeTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  upgradeSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  proFeatures: {
    marginBottom: 24,
    gap: 8,
  },
  proFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  proFeatureIcon: {
    fontSize: 14,
    marginRight: 12,
  },
  proFeatureText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    flex: 1,
  },
  upgradeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  proSection: {
    marginBottom: 20,
  },
  proBenefitsCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  proBenefitsTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  proBenefitsText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  earlySupporter: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  earlySupporterText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});