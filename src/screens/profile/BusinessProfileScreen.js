import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/common/Header';
import { colors } from '../../utils/colors';
import { api } from '../../services/api';

export default function BusinessProfileScreen({ navigation }) {
  const [businessData, setBusinessData] = useState({
    businessName: '',
    businessType: '',
    description: '',
    website: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    hours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: true },
    },
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
    },
    businessLogo: null,
    businessImages: [],
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    loadBusinessProfile();
  }, []);

  const loadBusinessProfile = async () => {
    try {
      const response = await api.get('/user/business-profile');
      if (response.data) {
        setBusinessData(response.data);
      }
    } catch (error) {
      console.error('Error loading business profile:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setBusinessData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleHoursChange = (day, field, value) => {
    setBusinessData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleSocialMediaChange = (platform, value) => {
    setBusinessData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value,
      },
    }));
  };

  const pickBusinessLogo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setBusinessData(prev => ({
        ...prev,
        businessLogo: result.assets[0].uri,
      }));
    }
  };

  const pickBusinessImages = async () => {
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
      setBusinessData(prev => ({
        ...prev,
        businessImages: [...prev.businessImages, ...result.assets.map(asset => asset.uri)],
      }));
    }
  };

  const removeBusinessImage = (index) => {
    setBusinessData(prev => ({
      ...prev,
      businessImages: prev.businessImages.filter((_, i) => i !== index),
    }));
  };

  const handleSaveProfile = async () => {
    const { businessName, businessType, phone, address, city, state, zipCode } = businessData;

    if (!businessName || !businessType || !phone || !address || !city || !state || !zipCode) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/user/business-profile', businessData);
      await refreshUser();
      Alert.alert('Success', 'Business profile saved successfully!');
    } catch (error) {
      console.error('Error saving business profile:', error);
      Alert.alert('Error', 'Failed to save business profile');
    } finally {
      setLoading(false);
    }
  };

  const businessTypes = [
    'Restaurant', 'Retail Store', 'Service Provider', 'Manufacturer',
    'Wholesaler', 'Technology', 'Healthcare', 'Education', 'Real Estate',
    'Entertainment', 'Non-Profit', 'Other'
  ];

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Business Profile"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity
            onPress={handleSaveProfile}
            disabled={loading}
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Business Logo */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Logo</Text>
            <TouchableOpacity style={styles.logoContainer} onPress={pickBusinessLogo}>
              {businessData.businessLogo ? (
                <Image source={{ uri: businessData.businessLogo }} style={styles.businessLogo} />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Ionicons name="camera" size={32} color={colors.gray} />
                  <Text style={styles.logoPlaceholderText}>Add Business Logo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Business Name *</Text>
              <TextInput
                style={styles.input}
                value={businessData.businessName}
                onChangeText={(value) => handleInputChange('businessName', value)}
                placeholder="Enter business name"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Business Type *</Text>
              <View style={styles.pickerContainer}>
                <TextInput
                  style={styles.input}
                  value={businessData.businessType}
                  onChangeText={(value) => handleInputChange('businessType', value)}
                  placeholder="Select or enter business type"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={businessData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                placeholder="Describe your business"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Website</Text>
              <TextInput
                style={styles.input}
                value={businessData.website}
                onChangeText={(value) => handleInputChange('website', value)}
                placeholder="https://www.yourbusiness.com"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Business Phone *</Text>
              <TextInput
                style={styles.input}
                value={businessData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                placeholder="Business phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Business Email</Text>
              <TextInput
                style={styles.input}
                value={businessData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="business@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Address</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Street Address *</Text>
              <TextInput
                style={styles.input}
                value={businessData.address}
                onChangeText={(value) => handleInputChange('address', value)}
                placeholder="Street address"
              />
            </View>

            <View style={styles.row}>
              <View style={styles.cityInput}>
                <Text style={styles.inputLabel}>City *</Text>
                <TextInput
                  style={styles.input}
                  value={businessData.city}
                  onChangeText={(value) => handleInputChange('city', value)}
                  placeholder="City"
                />
              </View>
              <View style={styles.stateInput}>
                <Text style={styles.inputLabel}>State *</Text>
                <TextInput
                  style={styles.input}
                  value={businessData.state}
                  onChangeText={(value) => handleInputChange('state', value)}
                  placeholder="State"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>ZIP Code *</Text>
              <TextInput
                style={styles.input}
                value={businessData.zipCode}
                onChangeText={(value) => handleInputChange('zipCode', value)}
                placeholder="ZIP Code"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Business Hours */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Hours</Text>
            {daysOfWeek.map((day) => (
              <View key={day.key} style={styles.hoursRow}>
                <Text style={styles.dayLabel}>{day.label}</Text>
                <View style={styles.hoursControls}>
                  <Switch
                    value={!businessData.hours[day.key].closed}
                    onValueChange={(value) => handleHoursChange(day.key, 'closed', !value)}
                    trackColor={{ false: colors.lightGray, true: colors.primary }}
                    thumbColor={!businessData.hours[day.key].closed ? colors.white : colors.gray}
                  />
                  {!businessData.hours[day.key].closed && (
                    <View style={styles.timeInputs}>
                      <TextInput
                        style={styles.timeInput}
                        value={businessData.hours[day.key].open}
                        onChangeText={(value) => handleHoursChange(day.key, 'open', value)}
                        placeholder="09:00"
                      />
                      <Text style={styles.timeSeparator}>to</Text>
                      <TextInput
                        style={styles.timeInput}
                        value={businessData.hours[day.key].close}
                        onChangeText={(value) => handleHoursChange(day.key, 'close', value)}
                        placeholder="17:00"
                      />
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Social Media */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Social Media</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Facebook</Text>
              <TextInput
                style={styles.input}
                value={businessData.socialMedia.facebook}
                onChangeText={(value) => handleSocialMediaChange('facebook', value)}
                placeholder="Facebook page URL"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Instagram</Text>
              <TextInput
                style={styles.input}
                value={businessData.socialMedia.instagram}
                onChangeText={(value) => handleSocialMediaChange('instagram', value)}
                placeholder="Instagram profile URL"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Twitter</Text>
              <TextInput
                style={styles.input}
                value={businessData.socialMedia.twitter}
                onChangeText={(value) => handleSocialMediaChange('twitter', value)}
                placeholder="Twitter profile URL"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Business Images */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Images</Text>
            <ScrollView horizontal style={styles.imagesContainer}>
              {businessData.businessImages.map((image, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: image }} style={styles.businessImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeBusinessImage(index)}
                  >
                    <Ionicons name="close" size={16} color={colors.white} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addImageButton} onPress={pickBusinessImages}>
                <Ionicons name="camera" size={24} color={colors.gray} />
                <Text style={styles.addImageText}>Add Photos</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Profile Status */}
          <View style={styles.section}>
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Business Profile Active</Text>
              <Switch
                value={businessData.isActive}
                onValueChange={(value) => handleInputChange('isActive', value)}
                trackColor={{ false: colors.lightGray, true: colors.primary }}
                thumbColor={businessData.isActive ? colors.white : colors.gray}
              />
            </View>
            <Text style={styles.statusDescription}>
              When active, your business profile will be visible to customers and you can create business listings.
            </Text>
          </View>
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
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
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
  logoContainer: {
    alignItems: 'center',
  },
  businessLogo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gray,
    borderStyle: 'dashed',
  },
  logoPlaceholderText: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 8,
    textAlign: 'center',
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cityInput: {
    width: '65%',
  },
  stateInput: {
    width: '30%',
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
  },
  dayLabel: {
    fontSize: 16,
    color: colors.text,
    width: 80,
  },
  hoursControls: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 14,
    width: 60,
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: 14,
    color: colors.gray,
    marginHorizontal: 8,
  },
  imagesContainer: {
    flexDirection: 'row',
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  businessImage: {
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
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  statusDescription: {
    fontSize: 14,
    color: colors.gray,
    lineHeight: 20,
  },
});
