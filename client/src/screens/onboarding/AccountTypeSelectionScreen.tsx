import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useApiRequest } from '../../hooks/useApiRequest';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Colors } from '../../constants/Colors';

type AccountType = 'personal' | 'dual';

interface AccountOption {
  type: AccountType;
  title: string;
  description: string;
  features: string[];
  icon: string;
  recommended?: boolean;
}

const ACCOUNT_OPTIONS: AccountOption[] = [
  {
    type: 'personal',
    title: 'Personal Account',
    description: 'Perfect for occasional buying and selling',
    icon: 'person',
    features: [
      'Buy and sell personal items',
      'Access to marketplace',
      'Community features',
      'Delivery tracking',
      'Basic profile features'
    ]
  },
  {
    type: 'dual',
    title: 'Personal + Business',
    description: 'Ideal for reaching local customers with your business',
    icon: 'business',
    recommended: true,
    features: [
      'Everything in Personal',
      'Business profile page',
      'Product catalog integration',
      'Custom pricing management',
      'Shop/Service/Entertainment sections',
      'Customer analytics',
      'Delivery preferences',
      'Self pickup options'
    ]
  }
];

export default function AccountTypeSelectionScreen({ navigation }: any) {
  const [selectedType, setSelectedType] = useState<AccountType>('personal');
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { apiRequest } = useApiRequest();

  const handleNext = async () => {
    setLoading(true);
    try {
      // Update user account type
      await apiRequest('PATCH', '/api/auth/profile', {
        accountType: selectedType,
      });

      if (selectedType === 'dual') {
        navigation.navigate('BusinessSetup');
      } else {
        navigation.navigate('OnboardingComplete');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save account type');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose Account Type</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressStep, styles.progressActive]} />
          <View style={[styles.progressStep, styles.progressActive]} />
          <View style={styles.progressStep} />
        </View>
        <Text style={styles.progressText}>Step 2 of 3</Text>

        {/* Main Content */}
        <Text style={styles.title}>How do you plan to use MarketPace?</Text>
        <Text style={styles.subtitle}>
          Choose the account type that best fits your needs. You can always upgrade later.
        </Text>

        {/* Account Options */}
        <View style={styles.optionsContainer}>
          {ACCOUNT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.type}
              style={[
                styles.optionCard,
                selectedType === option.type && styles.optionCardSelected
              ]}
              onPress={() => setSelectedType(option.type)}
            >
              <Card style={styles.optionCardInner}>
                <View style={styles.optionHeader}>
                  <View style={styles.optionTitleContainer}>
                    <Ionicons 
                      name={option.icon as any} 
                      size={24} 
                      color={selectedType === option.type ? Colors.primary : Colors.gray} 
                    />
                    <View style={styles.optionTitleTextContainer}>
                      <Text style={[
                        styles.optionTitle,
                        selectedType === option.type && styles.optionTitleSelected
                      ]}>
                        {option.title}
                      </Text>
                      {option.recommended && (
                        <View style={styles.recommendedBadge}>
                          <Text style={styles.recommendedText}>Recommended</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={[
                    styles.radioButton,
                    selectedType === option.type && styles.radioButtonSelected
                  ]}>
                    {selectedType === option.type && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                </View>

                <Text style={styles.optionDescription}>{option.description}</Text>

                <View style={styles.featuresContainer}>
                  {option.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Ionicons name="checkmark" size={16} color={Colors.success} />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue Button */}
        <Button
          title={selectedType === 'dual' ? 'Continue to Business Setup' : 'Complete Setup'}
          onPress={handleNext}
          loading={loading}
          style={styles.continueButton}
        />

        {/* Help Text */}
        <Text style={styles.helpText}>
          Don't worry - you can change your account type or add business features later in your profile settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressStep: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.lightGray,
    marginHorizontal: 4,
  },
  progressActive: {
    backgroundColor: Colors.primary,
  },
  progressText: {
    textAlign: 'center',
    color: Colors.gray,
    fontSize: 14,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionCard: {
    marginBottom: 16,
  },
  optionCardSelected: {
    transform: [{ scale: 1.02 }],
  },
  optionCardInner: {
    borderWidth: 2,
    borderColor: Colors.border,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  optionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  optionTitleTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: Colors.primary,
  },
  recommendedBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  recommendedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: Colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 16,
    lineHeight: 20,
  },
  featuresContainer: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  continueButton: {
    marginBottom: 20,
  },
  helpText: {
    fontSize: 12,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 18,
  },
});