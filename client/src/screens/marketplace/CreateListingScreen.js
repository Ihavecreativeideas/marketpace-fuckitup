import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  Switch,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';
import { CATEGORIES, LISTING_CONDITIONS, RENTAL_PERIODS, DELIVERY_OPTIONS } from '../../utils/constants';
import { useCreateListing } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import Header from '../../components/common/Header';

export default function CreateListingScreen({ navigation }) {
  const { user } = useAuth();
  const createListingMutation = useCreateListing();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: CATEGORIES.SHOPS,
    subcategory: '',
    price: '',
    condition: LISTING_CONDITIONS.GOOD,
    location: '',
    isRental: false,
    rentalPeriod: RENTAL_PERIODS.DAILY,
    isNegotiable: false,
    deliveryOptions: [DELIVERY_OPTIONS.BOTH],
    images: []
  });

  const [errors, setErrors] = useState({});

  const categories = [
    { id: CATEGORIES.SHOPS, name: 'Shops', icon: 'storefront' },
    { id: CATEGORIES.SERVICES, name: 'Services', icon: 'construct' },
    { id: CATEGORIES.ENTERTAINMENT, name: 'Entertainment', icon: 'play-circle' },
  ];

  const conditions = [
    { id: LISTING_CONDITIONS.NEW, name: 'New' },
    { id: LISTING_CONDITIONS.LIKE_NEW, name: 'Like New' },
    { id: LISTING_CONDITIONS.GOOD, name: 'Good' },
    { id: LISTING_CONDITIONS.FAIR, name: 'Fair' },
    { id: LISTING_CONDITIONS.POOR, name: 'Poor' },
  ];

  const rentalPeriods = [
    { id: RENTAL_PERIODS.DAILY, name: 'Per Day' },
    { id: RENTAL_PERIODS.WEEKLY, name: 'Per Week' },
    { id: RENTAL_PERIODS.MONTHLY, name: 'Per Month' },
  ];

  const deliveryOptionsList = [
    { id: DELIVERY_OPTIONS.PICKUP, name: 'Self Pickup Only' },
    { id: DELIVERY_OPTIONS.DELIVERY, name: 'Delivery Only' },
    { id: DELIVERY_OPTIONS.BOTH, name: 'Pickup & Delivery' },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleImagePicker = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to add images');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => asset.uri);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...newImages].slice(0, 5) // Max 5 images
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (formData.category === CATEGORIES.SHOPS && !formData.condition) {
      newErrors.condition = 'Condition is required for shop items';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      await createListingMutation.mutateAsync({
        ...formData,
        price: parseFloat(formData.price),
        deliveryOptions: formData.deliveryOptions,
      });

      Alert.alert(
        'Success',
        'Your listing has been created successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create listing. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Create Listing"
        showBackButton
        navigation={navigation}
        rightIcon="checkmark"
        onRightPress={handleSubmit}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Images Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <Text style={styles.sectionSubtitle}>Add up to 5 photos</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
            {formData.images.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: image }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))}
            
            {formData.images.length < 5 && (
              <TouchableOpacity style={styles.addImageButton} onPress={handleImagePicker}>
                <Ionicons name="camera" size={32} color={Colors.textTertiary} />
                <Text style={styles.addImageText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
              placeholder="What are you selling/offering?"
              maxLength={100}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.textArea, errors.description && styles.inputError]}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              placeholder="Describe your item or service..."
              multiline
              numberOfLines={4}
              maxLength={500}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    formData.category === category.id && styles.selectedChip
                  ]}
                  onPress={() => handleInputChange('category', category.id)}
                >
                  <Ionicons 
                    name={category.icon} 
                    size={16} 
                    color={formData.category === category.id ? Colors.white : Colors.textSecondary} 
                  />
                  <Text style={[
                    styles.chipText,
                    formData.category === category.id && styles.selectedChipText
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>This is a rental item</Text>
              <Text style={styles.switchSubtitle}>People can rent this for a period</Text>
            </View>
            <Switch
              value={formData.isRental}
              onValueChange={(value) => handleInputChange('isRental', value)}
              trackColor={{ false: Colors.lightGray, true: Colors.primary + '50' }}
              thumbColor={formData.isRental ? Colors.primary : Colors.gray}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: Spacing.md }]}>
              <Text style={styles.label}>Price *</Text>
              <View style={styles.priceInput}>
                <Text style={styles.currency}>$</Text>
                <TextInput
                  style={[styles.priceField, errors.price && styles.inputError]}
                  value={formData.price}
                  onChangeText={(value) => handleInputChange('price', value)}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                />
              </View>
              {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
            </View>

            {formData.isRental && (
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Period</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {rentalPeriods.map((period) => (
                    <TouchableOpacity
                      key={period.id}
                      style={[
                        styles.periodChip,
                        formData.rentalPeriod === period.id && styles.selectedChip
                      ]}
                      onPress={() => handleInputChange('rentalPeriod', period.id)}
                    >
                      <Text style={[
                        styles.chipText,
                        formData.rentalPeriod === period.id && styles.selectedChipText
                      ]}>
                        {period.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Price is negotiable</Text>
              <Text style={styles.switchSubtitle}>Allow buyers to make offers</Text>
            </View>
            <Switch
              value={formData.isNegotiable}
              onValueChange={(value) => handleInputChange('isNegotiable', value)}
              trackColor={{ false: Colors.lightGray, true: Colors.primary + '50' }}
              thumbColor={formData.isNegotiable ? Colors.primary : Colors.gray}
            />
          </View>
        </View>

        {/* Condition (for shops only) */}
        {formData.category === CATEGORIES.SHOPS && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Condition *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {conditions.map((condition) => (
                <TouchableOpacity
                  key={condition.id}
                  style={[
                    styles.conditionChip,
                    formData.condition === condition.id && styles.selectedChip
                  ]}
                  onPress={() => handleInputChange('condition', condition.id)}
                >
                  <Text style={[
                    styles.chipText,
                    formData.condition === condition.id && styles.selectedChipText
                  ]}>
                    {condition.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Location & Delivery */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location & Delivery</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={[styles.input, errors.location && styles.inputError]}
              value={formData.location}
              onChangeText={(value) => handleInputChange('location', value)}
              placeholder="City, State or ZIP code"
            />
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Delivery Options</Text>
            {deliveryOptionsList.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.deliveryOption,
                  formData.deliveryOptions.includes(option.id) && styles.selectedDeliveryOption
                ]}
                onPress={() => {
                  handleInputChange('deliveryOptions', [option.id]);
                }}
              >
                <View style={styles.deliveryOptionContent}>
                  <Text style={[
                    styles.deliveryOptionText,
                    formData.deliveryOptions.includes(option.id) && styles.selectedDeliveryOptionText
                  ]}>
                    {option.name}
                  </Text>
                </View>
                {formData.deliveryOptions.includes(option.id) && (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <TouchableOpacity
            style={[styles.submitButton, createListingMutation.isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={createListingMutation.isLoading}
          >
            <Text style={styles.submitButtonText}>
              {createListingMutation.isLoading ? 'Creating Listing...' : 'Create Listing'}
            </Text>
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
  },
  section: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  imagesContainer: {
    flexDirection: 'row',
  },
  imageWrapper: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: Spacing.borderRadius.md,
    backgroundColor: Colors.lightGray,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.white,
    borderRadius: 12,
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 2,
    borderColor: Colors.lightGray,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.lightGray,
    borderRadius: Spacing.borderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    ...Typography.body,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textArea: {
    backgroundColor: Colors.lightGray,
    borderRadius: Spacing.borderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    ...Typography.body,
    color: Colors.textPrimary,
    height: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.borderRadius.lg,
    marginRight: Spacing.sm,
  },
  conditionChip: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.borderRadius.lg,
    marginRight: Spacing.sm,
  },
  periodChip: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.borderRadius.md,
    marginRight: Spacing.xs,
  },
  selectedChip: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 14,
    marginLeft: Spacing.xs,
  },
  selectedChipText: {
    color: Colors.white,
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: Spacing.borderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  currency: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginRight: Spacing.xs,
  },
  priceField: {
    flex: 1,
    paddingVertical: Spacing.md,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  switchInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  switchLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  switchSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  deliveryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.lightGray,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    marginBottom: Spacing.sm,
  },
  selectedDeliveryOption: {
    backgroundColor: Colors.primary + '10',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  deliveryOptionContent: {
    flex: 1,
  },
  deliveryOptionText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  selectedDeliveryOptionText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  submitSection: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: Colors.gray,
  },
  submitButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
});
