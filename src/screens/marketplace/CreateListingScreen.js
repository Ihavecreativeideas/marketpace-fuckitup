import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/common/Header';
import { colors } from '../../utils/colors';
import { api } from '../../services/api';

export default function CreateListingScreen({ navigation, route }) {
  const { type } = route.params || {};
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: 'new',
    location: '',
    images: [],
    tags: '',
    availableForRent: false,
    rentPrice: '',
    rentPeriod: 'daily',
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const categories = {
    shop: [
      'Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Toys',
      'Automotive', 'Health & Beauty', 'Music', 'Art & Crafts'
    ],
    service: [
      'Cleaning', 'Repairs', 'Tutoring', 'Beauty', 'Fitness', 'Tech Support',
      'Lawn Care', 'Pet Care', 'Moving', 'Photography'
    ],
    event: [
      'Concerts', 'Sports', 'Food & Drink', 'Art & Culture', 'Business',
      'Community', 'Nightlife', 'Festivals', 'Workshops', 'Meetups'
    ]
  };

  const conditions = ['new', 'like_new', 'good', 'fair', 'poor'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...result.assets.map(asset => asset.uri)],
      }));
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    const { title, description, price, category, location, images } = formData;

    if (!title || !description || !price || !category || !location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Error', 'Please add at least one image');
      return;
    }

    setLoading(true);
    try {
      const listingData = {
        ...formData,
        type: type || 'shop',
        sellerId: user.id,
      };

      const response = await api.post('/marketplace/listings', listingData);
      
      Alert.alert('Success', 'Listing created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error creating listing:', error);
      Alert.alert('Error', 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={`Create ${type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Listing'}`}
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {/* Images Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Images *</Text>
            <ScrollView horizontal style={styles.imageContainer}>
              {formData.images.map((image, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: image }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close" size={16} color={colors.white} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
                <Ionicons name="camera" size={32} color={colors.gray} />
                <Text style={styles.addImageText}>Add Photos</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(value) => handleInputChange('title', value)}
                placeholder="Enter title"
                maxLength={100}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                placeholder="Describe your item/service"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Price *</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(value) => handleInputChange('price', value)}
                placeholder="0.00"
                keyboardType="numeric"
                left={<Text style={styles.pricePrefix}>$</Text>}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Category *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select category" value="" />
                  {categories[type || 'shop']?.map((cat) => (
                    <Picker.Item key={cat} label={cat} value={cat} />
                  ))}
                </Picker>
              </View>
            </View>

            {type !== 'event' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Condition</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.condition}
                    onValueChange={(value) => handleInputChange('condition', value)}
                    style={styles.picker}
                  >
                    {conditions.map((condition) => (
                      <Picker.Item 
                        key={condition} 
                        label={condition.replace('_', ' ').toUpperCase()} 
                        value={condition} 
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Location *</Text>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(value) => handleInputChange('location', value)}
                placeholder="Enter location"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Tags (optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.tags}
                onChangeText={(value) => handleInputChange('tags', value)}
                placeholder="Enter tags separated by commas"
              />
            </View>
          </View>

          {/* Rental Options */}
          {type !== 'event' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rental Options</Text>
              
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Available for rent</Text>
                <TouchableOpacity
                  style={[
                    styles.switch,
                    formData.availableForRent && styles.switchActive
                  ]}
                  onPress={() => handleInputChange('availableForRent', !formData.availableForRent)}
                >
                  <View style={[
                    styles.switchThumb,
                    formData.availableForRent && styles.switchThumbActive
                  ]} />
                </TouchableOpacity>
              </View>

              {formData.availableForRent && (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Rental Price</Text>
                    <TextInput
                      style={styles.input}
                      value={formData.rentPrice}
                      onChangeText={(value) => handleInputChange('rentPrice', value)}
                      placeholder="0.00"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Rental Period</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={formData.rentPeriod}
                        onValueChange={(value) => handleInputChange('rentPeriod', value)}
                        style={styles.picker}
                      >
                        <Picker.Item label="Daily" value="daily" />
                        <Picker.Item label="Weekly" value="weekly" />
                        <Picker.Item label="Monthly" value="monthly" />
                      </Picker>
                    </View>
                  </View>
                </>
              )}
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Creating...' : 'Create Listing'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    backgroundColor: colors.white,
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  imageContainer: {
    flexDirection: 'row',
  },
  imageWrapper: {
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
    backgroundColor: colors.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: 100,
    height: 100,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gray,
    borderStyle: 'dashed',
  },
  addImageText: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pricePrefix: {
    fontSize: 16,
    color: colors.text,
    paddingHorizontal: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  picker: {
    height: 50,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: colors.text,
  },
  switch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchActive: {
    backgroundColor: colors.primary,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  switchThumbActive: {
    transform: [{ translateX: 22 }],
  },
  submitButton: {
    backgroundColor: colors.primary,
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
