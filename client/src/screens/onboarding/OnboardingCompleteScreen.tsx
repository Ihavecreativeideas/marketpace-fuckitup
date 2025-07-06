import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/Colors';

export default function OnboardingCompleteScreen({ navigation }: any) {
  const { user } = useAuth();
  const scaleValue = new Animated.Value(0);

  React.useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, []);

  const handleGetStarted = () => {
    // Navigate to main app
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  const isBusinessAccount = user?.accountType === 'dual';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Animation */}
        <Animated.View style={[styles.successContainer, { transform: [{ scale: scaleValue }] }]}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={48} color="white" />
          </View>
        </Animated.View>

        {/* Welcome Message */}
        <Text style={styles.title}>Welcome to MarketPace!</Text>
        <Text style={styles.subtitle}>
          {isBusinessAccount 
            ? `Your business profile is ready to start reaching local customers`
            : `You're all set to explore your local marketplace`
          }
        </Text>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="storefront" size={24} color={Colors.primary} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Local Marketplace</Text>
              <Text style={styles.featureDescription}>
                Buy and sell with your neighbors
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="people" size={24} color={Colors.primary} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Community Connection</Text>
              <Text style={styles.featureDescription}>
                Join local discussions and events
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="car" size={24} color={Colors.primary} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Local Delivery</Text>
              <Text style={styles.featureDescription}>
                Fast delivery by neighborhood drivers
              </Text>
            </View>
          </View>

          {isBusinessAccount && (
            <View style={styles.featureItem}>
              <Ionicons name="business" size={24} color={Colors.primary} />
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>Business Tools</Text>
                <Text style={styles.featureDescription}>
                  Manage your business profile and reach customers
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Campaign Message */}
        <View style={styles.campaignContainer}>
          <View style={styles.campaignBadge}>
            <Ionicons name="gift" size={16} color={Colors.primary} />
            <Text style={styles.campaignText}>Early Supporter</Text>
          </View>
          <Text style={styles.campaignDescription}>
            You're part of our launch campaign! Enjoy all Pro features free 
            during our community building phase.
          </Text>
        </View>

        {/* Get Started Button */}
        <Button
          title="Start Exploring"
          onPress={handleGetStarted}
          style={styles.getStartedButton}
        />

        {/* Help Link */}
        <TouchableOpacity style={styles.helpContainer}>
          <Text style={styles.helpText}>
            Need help getting started? Visit our Help Center
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successContainer: {
    marginBottom: 40,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  featureTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.gray,
  },
  campaignContainer: {
    backgroundColor: '#F0F8FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: 40,
    width: '100%',
  },
  campaignBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  campaignText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  campaignDescription: {
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 20,
  },
  getStartedButton: {
    width: '100%',
    marginBottom: 20,
  },
  helpContainer: {
    padding: 10,
  },
  helpText: {
    fontSize: 14,
    color: Colors.primary,
    textAlign: 'center',
  },
});