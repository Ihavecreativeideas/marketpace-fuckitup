import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../hooks/useAuth';
import { useApiRequest } from '../../hooks/useApiRequest';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Colors } from '../../constants/Colors';

interface BusinessSetupData {
  businessName: string;
  businessType: 'shop' | 'service' | 'entertainment';
  businessDescription: string;
  businessLocation: string;
  businessCategories: string[];
  allowsDelivery: boolean;
  allowsPickup: boolean;
  customShipping: boolean;
}

const BUSINESS_TYPES = [
  { value: 'shop', label: 'Shop', description: 'Physical or online retail business', icon: 'storefront' },
  { value: 'service', label: 'Service', description: 'Professional services, labor, repairs', icon: 'construct' },
  { value: 'entertainment', label: 'Entertainment', description: 'DJs, bands, comedians, performers', icon: 'musical-notes' },
];

const SHOP_CATEGORIES = [
  'Clothing & Fashion', 'Electronics', 'Home & Garden', 'Health & Beauty',
  'Sports & Outdoors', 'Books & Media', 'Toys & Games', 'Art & Crafts',
  'Jewelry & Accessories', 'Pet Supplies', 'Food & Beverages', 'Automotive'
];

const SERVICE_CATEGORIES = [
  'Home Repair', 'Cleaning Services', 'Landscaping', 'Personal Training',
  'Tutoring', 'Pet Care', 'Photography', 'Catering', 'Transportation',
  'Technology Support', 'Beauty Services', 'Event Planning'
];

const ENTERTAINMENT_CATEGORIES = [
  'DJ Services', 'Live Music', 'Comedy', 'Dancing', 'Magic Shows',
  'Photography', 'Event Entertainment', 'Party Planning', 'Karaoke',
  'Theater', 'Workshops', 'Classes'
];

const getCategoriesByType = (type: string) => {
  switch (type) {
    case 'shop': return SHOP_CATEGORIES;
    case 'service': return SERVICE_CATEGORIES;
    case 'entertainment': return ENTERTAINMENT_CATEGORIES;
    default: return [];
  }
};

export default function BusinessSetupScreen({ navigation }: any) {
  const [formData, setFormData] = useState<BusinessSetupData>({
    businessName: '',
    businessType: 'shop',
    businessDescription: '',
    businessLocation: '',
    businessCategories: [],
    allowsDelivery: true,
    allowsPickup: true,
    customShipping: false,
  });
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { apiRequest } = useApiRequest();

  const toggleCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      businessCategories: prev.businessCategories.includes(category)
        ? prev.businessCategories.filter(c => c !== category)
        : [...prev.businessCategories, category]
    }));
  };

  const handleComplete = async () => {
    if (!formData.businessName.trim() || !formData.businessDescription.trim()) {
      Alert.alert('Required Fields', 'Please provide business name and description');
      return;
    }

    if (formData.businessCategories.length === 0) {
      Alert.alert('Required Fields', 'Please select at least one business category');
      return;
    }

    if (!formData.businessLocation.trim()) {
      Alert.alert('Required Fields', 'Please provide your business location');
      return;
    }

    setLoading(true);
    try {
      // Update user profile with business info
      await apiRequest('PATCH', '/api/auth/profile', {
        ...formData,
        onboardingCompleted: true,
      });

      navigation.navigate('OnboardingComplete');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save business profile');
    } finally {
      setLoading(false);
    }
  };

  const currentCategories = getCategoriesByType(formData.businessType);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Business Setup</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressStep, styles.progressActive]} />
          <View style={[styles.progressStep, styles.progressActive]} />
          <View style={[styles.progressStep, styles.progressActive]} />
        </View>
        <Text style={styles.progressText}>Step 3 of 3</Text>

        {/* Business Basic Info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Business Information</Text>
          
          <View style={styles.inputContainer}>
            <Ionicons name="business" size={20} color={Colors.gray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Business Name"
              value={formData.businessName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, businessName: text }))}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="location" size={20} color={Colors.gray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Business Location/Address"
              value={formData.businessLocation}
              onChangeText={(text) => setFormData(prev => ({ ...prev, businessLocation: text }))}
              multiline
            />
          </View>

          <TextInput
            style={styles.bioInput}
            placeholder="Describe your business and what you offer..."
            value={formData.businessDescription}
            onChangeText={(text) => setFormData(prev => ({ ...prev, businessDescription: text }))}
            multiline
            maxLength={300}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>{formData.businessDescription.length}/300</Text>
        </Card>

        {/* Business Type */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>What type of business do you have?</Text>
          
          <View style={styles.businessTypesContainer}>
            {BUSINESS_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.businessTypeCard,
                  formData.businessType === type.value && styles.businessTypeCardSelected
                ]}
                onPress={() => setFormData(prev => ({ 
                  ...prev, 
                  businessType: type.value as any,
                  businessCategories: [] // Reset categories when type changes
                }))}
              >
                <Ionicons 
                  name={type.icon as any} 
                  size={24} 
                  color={formData.businessType === type.value ? Colors.primary : Colors.gray} 
                />
                <Text style={[
                  styles.businessTypeTitle,
                  formData.businessType === type.value && styles.businessTypeTextSelected
                ]}>
                  {type.label}
                </Text>
                <Text style={styles.businessTypeDescription}>{type.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Categories */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Select your categories</Text>
          <Text style={styles.sectionDescription}>
            Choose categories that best describe your business
          </Text>
          
          <View style={styles.categoriesGrid}>
            {currentCategories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryTag,
                  formData.businessCategories.includes(category) && styles.categoryTagSelected
                ]}
                onPress={() => toggleCategory(category)}
              >
                <Text style={[
                  styles.categoryTagText,
                  formData.businessCategories.includes(category) && styles.categoryTagTextSelected
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Delivery Options */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery & Pickup Options</Text>
          <Text style={styles.sectionDescription}>
            How do you want customers to receive your products/services?
          </Text>

          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>MarketPace Delivery</Text>
              <Text style={styles.optionDescription}>Use our local delivery service</Text>
            </View>
            <Switch
              value={formData.allowsDelivery}
              onValueChange={(value) => setFormData(prev => ({ ...prev, allowsDelivery: value }))}
              trackColor={{ false: Colors.lightGray, true: Colors.primary }}
            />
          </View>

          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Self Pickup</Text>
              <Text style={styles.optionDescription}>Customers can pick up from your location</Text>
            </View>
            <Switch
              value={formData.allowsPickup}
              onValueChange={(value) => setFormData(prev => ({ ...prev, allowsPickup: value }))}
              trackColor={{ false: Colors.lightGray, true: Colors.primary }}
            />
          </View>

          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Custom Shipping</Text>
              <Text style={styles.optionDescription}>Use your existing shipping provider</Text>
            </View>
            <Switch
              value={formData.customShipping}
              onValueChange={(value) => setFormData(prev => ({ ...prev, customShipping: value }))}
              trackColor={{ false: Colors.lightGray, true: Colors.primary }}
            />
          </View>
        </Card>

        {/* Integration Note */}
        <Card style={[styles.section, styles.integrationNote]}>
          <View style={styles.integrationHeader}>
            <Ionicons name="sync" size={20} color={Colors.primary} />
            <Text style={styles.integrationTitle}>Easy Product Integration</Text>
          </View>
          <Text style={styles.integrationDescription}>
            After setup, you can easily import your existing product catalog, 
            maintain your current pricing, and integrate with your existing systems 
            without starting from scratch.
          </Text>
        </Card>

        {/* Complete Button */}
        <Button
          title="Complete Business Setup"
          onPress={handleComplete}
          loading={loading}
          style={styles.completeButton}
        />
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
    paddingBottom: 100,
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: 'white',
    marginBottom: 12,
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  bioInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    height: 100,
    fontSize: 16,
    backgroundColor: 'white',
  },
  characterCount: {
    textAlign: 'right',
    color: Colors.gray,
    fontSize: 12,
    marginTop: 4,
  },
  businessTypesContainer: {
    gap: 12,
  },
  businessTypeCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  businessTypeCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F8FF',
  },
  businessTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 8,
  },
  businessTypeTextSelected: {
    color: Colors.primary,
  },
  businessTypeDescription: {
    fontSize: 12,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: 4,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'white',
  },
  categoryTagSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryTagText: {
    fontSize: 14,
    color: Colors.text,
  },
  categoryTagTextSelected: {
    color: 'white',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
    color: Colors.gray,
  },
  integrationNote: {
    backgroundColor: '#F0F8FF',
    borderColor: Colors.primary,
  },
  integrationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  integrationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 8,
  },
  integrationDescription: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  completeButton: {
    marginTop: 20,
  },
});