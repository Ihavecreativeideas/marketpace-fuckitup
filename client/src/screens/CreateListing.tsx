import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function CreateListing({ navigation }: any) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    categoryId: '',
    condition: 'new',
    location: '',
    isRental: false,
    rentalPeriod: 'daily',
  });
  const [images, setImages] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: () => apiRequest('GET', '/api/categories'),
  });

  const createListingMutation = useMutation({
    mutationFn: async (listingData: any) => {
      return apiRequest('POST', '/api/listings', listingData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/my-listings'] });
      toast({
        title: 'Listing Created',
        description: 'Your listing has been created successfully',
        variant: 'success',
      });
      navigation.goBack();
    },
    onError: (error) => {
      toast({
        title: 'Creation Failed',
        description: 'Failed to create listing. Please try again.',
        variant: 'error',
      });
    },
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled) {
        setImages(prev => [...prev, ...result.assets]);
      }
    } catch (error) {
      console.error('Error adding image:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'error',
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Title is required',
        variant: 'error',
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Description is required',
        variant: 'error',
      });
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast({
        title: 'Invalid Price',
        description: 'Please enter a valid price',
        variant: 'error',
      });
      return;
    }

    if (!formData.categoryId) {
      toast({
        title: 'Missing Category',
        description: 'Please select a category',
        variant: 'error',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real app, you would upload the images to a cloud storage service
      // For now, we'll simulate the upload URLs
      const imageUrls = images.map((_, index) => `https://example.com/image${index}.jpg`);

      const listingData = {
        ...formData,
        price: parseFloat(formData.price),
        categoryId: parseInt(formData.categoryId),
        images: imageUrls,
      };

      await createListingMutation.mutateAsync(listingData);
    } catch (error) {
      console.error('Error creating listing:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const conditionOptions = [
    { label: 'New', value: 'new' },
    { label: 'Used - Like New', value: 'like_new' },
    { label: 'Used - Good', value: 'good' },
    { label: 'Used - Fair', value: 'fair' },
    { label: 'Refurbished', value: 'refurbished' },
  ];

  const rentalPeriodOptions = [
    { label: 'Hourly', value: 'hourly' },
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Listing</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Images Section */}
      <Card style={styles.imagesCard}>
        <Text style={styles.sectionTitle}>Photos</Text>
        <Text style={styles.sectionSubtitle}>
          Add photos to show your item. First photo will be the cover.
        </Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
          {images.map((image, index) => (
            <View key={index} style={styles.imageItem}>
              <Image source={{ uri: image.uri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => handleRemoveImage(index)}
              >
                <Ionicons name="close-circle" size={24} color="#FF3B30" />
              </TouchableOpacity>
              {index === 0 && (
                <View style={styles.coverBadge}>
                  <Text style={styles.coverBadgeText}>Cover</Text>
                </View>
              )}
            </View>
          ))}
          
          <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
            <Ionicons name="camera" size={32} color="#666" />
            <Text style={styles.addImageText}>Add Photo</Text>
          </TouchableOpacity>
        </ScrollView>
      </Card>

      {/* Basic Information */}
      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <Input
          label="Title"
          value={formData.title}
          onChangeText={(value) => handleInputChange('title', value)}
          placeholder="What are you selling?"
          maxLength={100}
        />
        
        <Input
          label="Description"
          value={formData.description}
          onChangeText={(value) => handleInputChange('description', value)}
          placeholder="Describe your item..."
          multiline
          numberOfLines={4}
          style={styles.textArea}
        />
        
        <View style={styles.priceContainer}>
          <Input
            label={formData.isRental ? `Price per ${formData.rentalPeriod}` : 'Price'}
            value={formData.price}
            onChangeText={(value) => handleInputChange('price', value)}
            placeholder="0.00"
            keyboardType="decimal-pad"
            containerStyle={styles.priceInput}
          />
          <Text style={styles.currencySymbol}>$</Text>
        </View>
      </Card>

      {/* Category and Details */}
      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>Category & Details</Text>
        
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Category</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={formData.categoryId}
              onValueChange={(value) => handleInputChange('categoryId', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select a category" value="" />
              {categories.map((category: any) => (
                <Picker.Item
                  key={category.id}
                  label={category.name}
                  value={category.id.toString()}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Condition</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={formData.condition}
              onValueChange={(value) => handleInputChange('condition', value)}
              style={styles.picker}
            >
              {conditionOptions.map((option) => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </Picker>
          </View>
        </View>

        <Input
          label="Location"
          value={formData.location}
          onChangeText={(value) => handleInputChange('location', value)}
          placeholder="City, State"
        />
      </Card>

      {/* Rental Options */}
      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>Listing Type</Text>
        
        <View style={styles.switchContainer}>
          <View style={styles.switchInfo}>
            <Text style={styles.switchLabel}>Rental Item</Text>
            <Text style={styles.switchDescription}>
              Allow people to rent this item instead of buying
            </Text>
          </View>
          <Switch
            value={formData.isRental}
            onValueChange={(value) => handleInputChange('isRental', value)}
            trackColor={{ false: '#767577', true: '#007AFF' }}
            thumbColor={formData.isRental ? '#ffffff' : '#f4f3f4'}
          />
        </View>

        {formData.isRental && (
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Rental Period</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.rentalPeriod}
                onValueChange={(value) => handleInputChange('rentalPeriod', value)}
                style={styles.picker}
              >
                {rentalPeriodOptions.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>
          </View>
        )}
      </Card>

      {/* Rental Disclaimer */}
      {formData.isRental && (
        <Card style={styles.disclaimerCard}>
          <View style={styles.disclaimerHeader}>
            <Ionicons name="warning" size={24} color="#FF9800" />
            <Text style={styles.disclaimerTitle}>Rental Terms</Text>
          </View>
          <Text style={styles.disclaimerText}>
            MarketPace is not responsible for lost, stolen, or damaged rental items. 
            All rental terms and conditions are negotiated between you and the renter. 
            You are responsible for all communication and arrangements.
          </Text>
          <Text style={styles.disclaimerText}>
            Note: Renters must pay for both delivery and pickup unless self-pickup is arranged.
          </Text>
        </Card>
      )}

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <Button
          title="Create Listing"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.submitButton}
        />
        
        <Text style={styles.submitNote}>
          By creating this listing, you agree to MarketPace's terms of service and community guidelines.
        </Text>
      </View>
    </ScrollView>
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
  imagesCard: {
    margin: 16,
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
  imagesContainer: {
    flexDirection: 'row',
  },
  imageItem: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  coverBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: '#007AFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coverBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  addImageText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  formCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  priceInput: {
    flex: 1,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginLeft: 8,
  },
  pickerContainer: {
    marginVertical: 8,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  picker: {
    height: 50,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  switchDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  disclaimerCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff8e1',
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  submitContainer: {
    padding: 16,
  },
  submitButton: {
    marginBottom: 12,
  },
  submitNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
});
