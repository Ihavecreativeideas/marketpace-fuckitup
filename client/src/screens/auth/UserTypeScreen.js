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

export default function UserTypeScreen({ navigation }) {
  const { updateUser } = useAuth();
  const [selectedTypes, setSelectedTypes] = useState(['buyer']);

  const userTypes = [
    {
      id: 'buyer',
      title: 'Buyer',
      description: 'Browse and purchase items',
      icon: 'bag-handle',
      color: Colors.primary,
      required: true,
    },
    {
      id: 'seller',
      title: 'Seller',
      description: 'Sell your items',
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
  ];

  const handleTypeToggle = (typeId) => {
    if (typeId === 'buyer') return; // Buyer is always required
    
    setSelectedTypes(prev => {
      if (prev.includes(typeId)) {
        return prev.filter(id => id !== typeId);
      } else {
        return [...prev, typeId];
      }
    });
  };

  const handleContinue = () => {
    if (selectedTypes.length === 0) {
      Alert.alert('Error', 'Please select at least one user type');
      return;
    }

    // Update user profile with selected types
    updateUser({
      userType: selectedTypes.join(','),
      hasBusinessProfile: selectedTypes.includes('seller'),
      isDriverVerified: selectedTypes.includes('driver'),
    });

    // Navigate to main app
    navigation.navigate('Main');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="User Type"
        showBackButton
        navigation={navigation}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>How will you use MarketPace?</Text>
          <Text style={styles.subtitle}>
            Select all that apply. You can change this later in your profile.
          </Text>
        </View>

        {/* User Type Selection */}
        <View style={styles.userTypes}>
          {userTypes.map((type) => {
            const isSelected = selectedTypes.includes(type.id);
            const isRequired = type.required;
            
            return (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.userTypeCard,
                  isSelected && styles.selectedCard,
                  isRequired && styles.requiredCard
                ]}
                onPress={() => handleTypeToggle(type.id)}
                disabled={isRequired}
              >
                <View style={[styles.iconContainer, { backgroundColor: type.color + '20' }]}>
                  <Ionicons name={type.icon} size={32} color={type.color} />
                </View>
                
                <View style={styles.typeContent}>
                  <View style={styles.typeHeader}>
                    <Text style={styles.typeTitle}>{type.title}</Text>
                    {isRequired && (
                      <View style={styles.requiredBadge}>
                        <Text style={styles.requiredText}>Required</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.typeDescription}>{type.description}</Text>
                </View>

                <View style={styles.checkbox}>
                  <Ionicons 
                    name={isSelected ? "checkbox" : "square-outline"} 
                    size={24} 
                    color={isSelected ? Colors.primary : Colors.gray} 
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Special Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>What you'll get access to:</Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="flash" size={20} color={Colors.primary} />
              <Text style={styles.featureText}>Instant delivery service</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="people" size={20} color={Colors.primary} />
              <Text style={styles.featureText}>Community marketplace</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="calendar" size={20} color={Colors.primary} />
              <Text style={styles.featureText}>Rent anything feature</Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
              <Text style={styles.featureText}>Secure transactions</Text>
            </View>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        {/* Pro Membership Teaser */}
        <View style={styles.proTeaser}>
          <View style={styles.proHeader}>
            <Ionicons name="star" size={24} color={Colors.warning} />
            <Text style={styles.proTitle}>MarketPace Pro</Text>
          </View>
          <Text style={styles.proDescription}>
            Get advanced features, priority support, and exclusive deals
          </Text>
          <TouchableOpacity style={styles.proButton}>
            <Text style={styles.proButtonText}>Learn More</Text>
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
    textAlign: 'center',
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
  requiredCard: {
    borderColor: Colors.warning,
    backgroundColor: Colors.warning + '05',
  },
  iconContainer: {
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.lg,
    marginRight: Spacing.md,
  },
  typeContent: {
    flex: 1,
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  typeTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginRight: Spacing.sm,
  },
  requiredBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.borderRadius.sm,
  },
  requiredText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  typeDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  checkbox: {
    marginLeft: Spacing.sm,
  },
  featuresSection: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: Spacing.borderRadius.lg,
    marginBottom: Spacing.xl,
  },
  featuresTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  featuresList: {
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  continueButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
  proTeaser: {
    backgroundColor: Colors.warning + '10',
    padding: Spacing.lg,
    borderRadius: Spacing.borderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  proHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  proTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  proDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  proButton: {
    backgroundColor: Colors.warning,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.borderRadius.md,
  },
  proButtonText: {
    ...Typography.button,
    color: Colors.white,
    fontSize: 14,
  },
});
