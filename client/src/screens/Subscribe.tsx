import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StripeProvider, useStripe, CardField } from '../components/web/StripeWeb';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

function SubscribeForm({ navigation }: any) {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isProcessing, setIsProcessing] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { confirmPayment } = useStripe();

  const { data: subscriptionData } = useQuery({
    queryKey: ['/api/subscription-status'],
    queryFn: () => apiRequest('GET', '/api/subscription-status'),
    enabled: !!user,
  });

  const subscribeMutation = useMutation({
    mutationFn: async (planType: string) => {
      return apiRequest('POST', '/api/create-subscription', { planType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-status'] });
      toast({
        title: 'Subscription Active',
        description: 'Welcome to MarketPace Pro!',
        variant: 'success',
      });
      navigation.goBack();
    },
    onError: () => {
      toast({
        title: 'Subscription Failed',
        description: 'Failed to activate subscription. Please try again.',
        variant: 'error',
      });
    },
  });

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly Pro',
      price: 9.99,
      period: 'month',
      savings: null,
      popular: false,
    },
    {
      id: 'yearly',
      name: 'Yearly Pro',
      price: 79.99,
      period: 'year',
      savings: '33% off',
      popular: true,
    },
  ];

  const proFeatures = [
    {
      icon: 'infinite',
      title: 'Unlimited Listings',
      description: 'Create as many listings as you want',
    },
    {
      icon: 'walk',
      title: 'Self Pickup Option',
      description: 'Allow buyers to pick up items directly',
    },
    {
      icon: 'trending-up',
      title: 'Priority Placement',
      description: 'Your listings appear higher in search results',
    },
    {
      icon: 'analytics',
      title: 'Advanced Analytics',
      description: 'Detailed insights on your listings and sales',
    },
    {
      icon: 'shield-checkmark',
      title: 'Verified Seller Badge',
      description: 'Build trust with a verified seller badge',
    },
    {
      icon: 'chatbubbles',
      title: 'Priority Support',
      description: 'Get faster customer support responses',
    },
    {
      icon: 'gift',
      title: 'Exclusive Features',
      description: 'Early access to new features and tools',
    },
    {
      icon: 'star',
      title: 'Enhanced Profile',
      description: 'Customize your seller profile with Pro themes',
    },
  ];

  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    setIsProcessing(true);

    try {
      // Create subscription
      const subscriptionResponse = await apiRequest('POST', '/api/create-subscription', {
        planType: selectedPlan,
      });

      if (subscriptionResponse.clientSecret) {
        // Confirm payment with Stripe
        const { error } = await confirmPayment(subscriptionResponse.clientSecret, {
          paymentMethodType: 'Card',
        });

        if (error) {
          toast({
            title: 'Payment Failed',
            description: error.message,
            variant: 'error',
          });
          return;
        }
      }

      await subscribeMutation.mutateAsync(selectedPlan);
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: 'Subscription Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManageSubscription = () => {
    // Navigate to subscription management
    console.log('Manage subscription');
  };

  const renderPlanCard = (plan: any) => (
    <TouchableOpacity
      key={plan.id}
      style={[
        styles.planCard,
        selectedPlan === plan.id && styles.selectedPlanCard,
        plan.popular && styles.popularPlanCard,
      ]}
      onPress={() => setSelectedPlan(plan.id)}
    >
      {plan.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>Most Popular</Text>
        </View>
      )}
      
      <View style={styles.planHeader}>
        <Text style={styles.planName}>{plan.name}</Text>
        {plan.savings && (
          <Badge text={plan.savings} variant="success" size="small" />
        )}
      </View>
      
      <View style={styles.planPricing}>
        <Text style={styles.planPrice}>${plan.price}</Text>
        <Text style={styles.planPeriod}>/{plan.period}</Text>
      </View>
      
      {plan.id === 'yearly' && (
        <Text style={styles.planSavings}>
          Save ${(9.99 * 12 - plan.price).toFixed(2)} per year
        </Text>
      )}
      
      {selectedPlan === plan.id && (
        <View style={styles.selectedIndicator}>
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderFeature = (feature: any) => (
    <View key={feature.title} style={styles.feature}>
      <View style={styles.featureIcon}>
        <Ionicons name={feature.icon as any} size={20} color="#007AFF" />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </View>
    </View>
  );

  if (user?.isPro) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>MarketPace Pro</Text>
          <View style={{ width: 24 }} />
        </View>

        <Card style={styles.activeSubscriptionCard}>
          <View style={styles.activeSubscriptionHeader}>
            <Ionicons name="star" size={32} color="#FFD700" />
            <Text style={styles.activeSubscriptionTitle}>You're a Pro Member!</Text>
          </View>
          
          <Text style={styles.activeSubscriptionSubtitle}>
            Enjoy all the premium features of MarketPace Pro
          </Text>

          <View style={styles.subscriptionDetails}>
            <Text style={styles.subscriptionPlan}>
              Plan: {subscriptionData?.planType === 'yearly' ? 'Yearly Pro' : 'Monthly Pro'}
            </Text>
            <Text style={styles.subscriptionRenewal}>
              Renews: {subscriptionData?.nextBillingDate || 'N/A'}
            </Text>
          </View>

          <Button
            title="Manage Subscription"
            onPress={handleManageSubscription}
            variant="outline"
            style={styles.manageButton}
          />
        </Card>

        <Card style={styles.featuresCard}>
          <Text style={styles.sectionTitle}>Your Pro Features</Text>
          {proFeatures.map(renderFeature)}
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MarketPace Pro</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Hero Section */}
      <Card style={styles.heroCard}>
        <View style={styles.heroContent}>
          <Ionicons name="star" size={48} color="#FFD700" />
          <Text style={styles.heroTitle}>Unlock Premium Features</Text>
          <Text style={styles.heroSubtitle}>
            Take your marketplace experience to the next level with Pro
          </Text>
        </View>
      </Card>

      {/* Campaign Launch Trial */}
      <Card style={styles.trialCard}>
        <View style={styles.trialHeader}>
          <Ionicons name="gift" size={24} color="#4CAF50" />
          <Text style={styles.trialTitle}>Campaign Launch Special</Text>
        </View>
        <Text style={styles.trialDescription}>
          Get all Pro features FREE during our campaign launch period! 
          This is a limited-time offer for early supporters.
        </Text>
        <Badge text="Free Trial Active" variant="success" />
      </Card>

      {/* Pricing Plans */}
      <View style={styles.plansSection}>
        <Text style={styles.sectionTitle}>Choose Your Plan</Text>
        <Text style={styles.sectionSubtitle}>
          Upgrade anytime, cancel anytime
        </Text>
        
        <View style={styles.plansContainer}>
          {plans.map(renderPlanCard)}
        </View>
      </View>

      {/* Features List */}
      <Card style={styles.featuresCard}>
        <Text style={styles.sectionTitle}>What's Included</Text>
        {proFeatures.map(renderFeature)}
      </Card>

      {/* Payment Method */}
      <Card style={styles.paymentCard}>
        <Text style={styles.sectionTitle}>Payment Information</Text>
        
        <View style={styles.cardInputContainer}>
          <Text style={styles.cardInputLabel}>Card Information</Text>
          <CardField
            postalCodeEnabled={true}
            placeholders={{
              number: '4242 4242 4242 4242',
            }}
            cardStyle={styles.cardInput}
            style={styles.cardField}
          />
        </View>

        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
          <Text style={styles.securityText}>
            Your payment information is secure and encrypted
          </Text>
        </View>
      </Card>

      {/* Subscribe Button */}
      <View style={styles.subscribeContainer}>
        <Button
          title={`Start Pro Subscription • $${plans.find(p => p.id === selectedPlan)?.price || 0}/month`}
          onPress={handleSubscribe}
          loading={isProcessing}
          disabled={isProcessing}
          style={styles.subscribeButton}
        />
        
        <Text style={styles.subscribeNote}>
          Cancel anytime. No long-term commitments.
        </Text>
        
        <Text style={styles.termsText}>
          By subscribing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </ScrollView>
  );
}

export default function Subscribe({ navigation }: any) {
  return (
    <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_default'}>
      <SubscribeForm navigation={navigation} />
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  heroCard: {
    margin: 16,
    backgroundColor: '#007AFF',
  },
  heroContent: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 12,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  trialCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#f0f8ff',
  },
  trialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  trialTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  trialDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  plansSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  plansContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  planCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  selectedPlanCard: {
    borderColor: '#007AFF',
  },
  popularPlanCard: {
    borderColor: '#4CAF50',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: '50%',
    transform: [{ translateX: -40 }],
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  planPeriod: {
    fontSize: 14,
    color: '#666',
  },
  planSavings: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  featuresCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  paymentCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  cardInputContainer: {
    marginBottom: 16,
  },
  cardInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  cardField: {
    width: '100%',
    height: 50,
  },
  cardInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  subscribeContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  subscribeButton: {
    marginBottom: 12,
  },
  subscribeNote: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
  },
  activeSubscriptionCard: {
    margin: 16,
    alignItems: 'center',
    paddingVertical: 30,
  },
  activeSubscriptionHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  activeSubscriptionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  activeSubscriptionSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  subscriptionDetails: {
    alignItems: 'center',
    marginBottom: 20,
  },
  subscriptionPlan: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  subscriptionRenewal: {
    fontSize: 14,
    color: '#666',
  },
  manageButton: {
    minWidth: 150,
  },
});
