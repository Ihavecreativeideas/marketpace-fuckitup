import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/common/Header';
import { colors } from '../../utils/colors';
import { api } from '../../services/api';

export default function DriverApplicationScreen({ navigation }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    dateOfBirth: '',
    driversLicense: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    licensePlate: '',
    insuranceCompany: '',
    insurancePolicyNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    bankAccountNumber: '',
    bankRoutingNumber: '',
    hasBackgroundCheck: false,
    backgroundCheckProvider: '',
    backgroundCheckDate: '',
    agreedToTerms: false,
  });

  const [documents, setDocuments] = useState({
    driversLicensePhoto: null,
    insuranceCard: null,
    vehicleRegistration: null,
    backgroundCheck: null,
    profilePhoto: null,
  });

  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const pickImage = async (field) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: field === 'profilePhoto' ? [1, 1] : [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setDocuments(prev => ({
        ...prev,
        [field]: result.assets[0],
      }));
    }
  };

  const pickDocument = async (field) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: false,
      });

      if (!result.canceled) {
        setDocuments(prev => ({
          ...prev,
          [field]: result.assets[0],
        }));
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const validateForm = () => {
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state',
      'zipCode', 'dateOfBirth', 'driversLicense', 'vehicleMake', 'vehicleModel',
      'vehicleYear', 'vehicleColor', 'licensePlate', 'insuranceCompany',
      'insurancePolicyNumber', 'emergencyContactName', 'emergencyContactPhone',
      'bankAccountNumber', 'bankRoutingNumber'
    ];

    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return false;
    }

    const requiredDocuments = [
      'driversLicensePhoto', 'insuranceCard', 'vehicleRegistration', 'profilePhoto'
    ];

    const missingDocuments = requiredDocuments.filter(doc => !documents[doc]);
    if (missingDocuments.length > 0) {
      Alert.alert('Missing Documents', 'Please upload all required documents');
      return false;
    }

    if (!formData.hasBackgroundCheck) {
      Alert.alert('Background Check Required', 'You must complete a background check to become a driver');
      return false;
    }

    if (!formData.agreedToTerms) {
      Alert.alert('Terms Agreement', 'You must agree to the terms and conditions');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Add documents
      Object.keys(documents).forEach(key => {
        if (documents[key]) {
          formDataToSend.append(key, {
            uri: documents[key].uri,
            type: documents[key].mimeType || 'image/jpeg',
            name: documents[key].name || `${key}.jpg`,
          });
        }
      });

      const response = await api.post('/drivers/apply', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert(
        'Application Submitted!',
        'Your driver application has been submitted successfully. We will review your application and background check, then send you login credentials via email if approved.',
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    } catch (error) {
      console.error('Error submitting application:', error);
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderDocumentUpload = (field, title, required = true) => (
    <View style={styles.documentContainer}>
      <Text style={styles.documentTitle}>
        {title} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TouchableOpacity
        style={styles.documentUpload}
        onPress={() => field === 'profilePhoto' ? pickImage(field) : pickDocument(field)}
      >
        {documents[field] ? (
          <View style={styles.documentPreview}>
            {field === 'profilePhoto' ? (
              <Image source={{ uri: documents[field].uri }} style={styles.profilePreview} />
            ) : (
              <Ionicons name="document-attach" size={40} color={colors.success} />
            )}
            <Text style={styles.documentName}>{documents[field].name}</Text>
          </View>
        ) : (
          <View style={styles.documentPlaceholder}>
            <Ionicons name="cloud-upload-outline" size={32} color={colors.gray} />
            <Text style={styles.documentPlaceholderText}>
              {field === 'profilePhoto' ? 'Select Photo' : 'Upload Document'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Driver Application"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {/* Header Info */}
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Become a MarketPace Driver</Text>
            <Text style={styles.headerSubtitle}>
              Join our independent contractor network and start earning money delivering items in your area.
            </Text>
          </View>

          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>First Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                  placeholder="First Name"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Last Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                  placeholder="Last Name"
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="Phone Number"
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>Date of Birth *</Text>
            <TextInput
              style={styles.input}
              value={formData.dateOfBirth}
              onChangeText={(value) => handleInputChange('dateOfBirth', value)}
              placeholder="MM/DD/YYYY"
            />

            <Text style={styles.inputLabel}>Driver's License Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.driversLicense}
              onChangeText={(value) => handleInputChange('driversLicense', value)}
              placeholder="Driver's License Number"
            />

            {renderDocumentUpload('profilePhoto', 'Profile Photo')}
            {renderDocumentUpload('driversLicensePhoto', 'Driver\'s License Photo')}
          </View>

          {/* Address Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address Information</Text>
            
            <Text style={styles.inputLabel}>Street Address *</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              placeholder="Street Address"
            />

            <View style={styles.row}>
              <View style={styles.cityInput}>
                <Text style={styles.inputLabel}>City *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.city}
                  onChangeText={(value) => handleInputChange('city', value)}
                  placeholder="City"
                />
              </View>
              <View style={styles.stateInput}>
                <Text style={styles.inputLabel}>State *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.state}
                  onChangeText={(value) => handleInputChange('state', value)}
                  placeholder="State"
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>ZIP Code *</Text>
            <TextInput
              style={styles.input}
              value={formData.zipCode}
              onChangeText={(value) => handleInputChange('zipCode', value)}
              placeholder="ZIP Code"
              keyboardType="numeric"
            />
          </View>

          {/* Vehicle Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehicle Information</Text>
            
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Make *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.vehicleMake}
                  onChangeText={(value) => handleInputChange('vehicleMake', value)}
                  placeholder="Make"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Model *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.vehicleModel}
                  onChangeText={(value) => handleInputChange('vehicleModel', value)}
                  placeholder="Model"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Year *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.vehicleYear}
                  onChangeText={(value) => handleInputChange('vehicleYear', value)}
                  placeholder="Year"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Color *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.vehicleColor}
                  onChangeText={(value) => handleInputChange('vehicleColor', value)}
                  placeholder="Color"
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>License Plate *</Text>
            <TextInput
              style={styles.input}
              value={formData.licensePlate}
              onChangeText={(value) => handleInputChange('licensePlate', value)}
              placeholder="License Plate"
            />

            {renderDocumentUpload('vehicleRegistration', 'Vehicle Registration')}
          </View>

          {/* Insurance Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Insurance Information</Text>
            
            <Text style={styles.inputLabel}>Insurance Company *</Text>
            <TextInput
              style={styles.input}
              value={formData.insuranceCompany}
              onChangeText={(value) => handleInputChange('insuranceCompany', value)}
              placeholder="Insurance Company"
            />

            <Text style={styles.inputLabel}>Policy Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.insurancePolicyNumber}
              onChangeText={(value) => handleInputChange('insurancePolicyNumber', value)}
              placeholder="Policy Number"
            />

            {renderDocumentUpload('insuranceCard', 'Insurance Card')}
          </View>

          {/* Emergency Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            
            <Text style={styles.inputLabel}>Contact Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.emergencyContactName}
              onChangeText={(value) => handleInputChange('emergencyContactName', value)}
              placeholder="Emergency Contact Name"
            />

            <Text style={styles.inputLabel}>Contact Phone *</Text>
            <TextInput
              style={styles.input}
              value={formData.emergencyContactPhone}
              onChangeText={(value) => handleInputChange('emergencyContactPhone', value)}
              placeholder="Emergency Contact Phone"
              keyboardType="phone-pad"
            />
          </View>

          {/* Banking Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Banking Information</Text>
            <Text style={styles.sectionSubtitle}>
              For direct deposit of your earnings
            </Text>
            
            <Text style={styles.inputLabel}>Bank Account Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.bankAccountNumber}
              onChangeText={(value) => handleInputChange('bankAccountNumber', value)}
              placeholder="Bank Account Number"
              keyboardType="numeric"
              secureTextEntry
            />

            <Text style={styles.inputLabel}>Bank Routing Number *</Text>
            <TextInput
              style={styles.input}
              value={formData.bankRoutingNumber}
              onChangeText={(value) => handleInputChange('bankRoutingNumber', value)}
              placeholder="Bank Routing Number"
              keyboardType="numeric"
            />
          </View>

          {/* Background Check */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Background Check</Text>
            <Text style={styles.sectionSubtitle}>
              You must complete a background check through an approved provider at your own expense.
            </Text>
            
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={[styles.checkbox, formData.hasBackgroundCheck && styles.checkboxActive]}
                onPress={() => handleInputChange('hasBackgroundCheck', !formData.hasBackgroundCheck)}
              >
                {formData.hasBackgroundCheck && (
                  <Ionicons name="checkmark" size={16} color={colors.white} />
                )}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>
                I have completed a background check *
              </Text>
            </View>

            {formData.hasBackgroundCheck && (
              <>
                <Text style={styles.inputLabel}>Background Check Provider *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.backgroundCheckProvider}
                  onChangeText={(value) => handleInputChange('backgroundCheckProvider', value)}
                  placeholder="e.g., Checkr, Sterling, etc."
                />

                <Text style={styles.inputLabel}>Background Check Date *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.backgroundCheckDate}
                  onChangeText={(value) => handleInputChange('backgroundCheckDate', value)}
                  placeholder="MM/DD/YYYY"
                />

                {renderDocumentUpload('backgroundCheck', 'Background Check Results')}
              </>
            )}
          </View>

          {/* Terms and Conditions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Terms and Conditions</Text>
            
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={[styles.checkbox, formData.agreedToTerms && styles.checkboxActive]}
                onPress={() => handleInputChange('agreedToTerms', !formData.agreedToTerms)}
              >
                {formData.agreedToTerms && (
                  <Ionicons name="checkmark" size={16} color={colors.white} />
                )}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>
                I agree to the terms and conditions as an independent contractor *
              </Text>
            </View>

            <Text style={styles.disclaimer}>
              By submitting this application, I acknowledge that I am applying to be an independent contractor, 
              not an employee of MarketPace. I understand that I must provide all required documentation and 
              pass a background check to be approved as a driver.
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Submitting Application...' : 'Submit Application'}
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
  headerInfo: {
    backgroundColor: colors.primary,
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
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
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  cityInput: {
    width: '65%',
  },
  stateInput: {
    width: '30%',
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
    marginBottom: 16,
  },
  required: {
    color: colors.error,
  },
  documentContainer: {
    marginBottom: 16,
  },
  documentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  documentUpload: {
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderRadius: 8,
    borderStyle: 'dashed',
    padding: 16,
    alignItems: 'center',
  },
  documentPreview: {
    alignItems: 'center',
  },
  profilePreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  documentName: {
    fontSize: 14,
    color: colors.text,
    marginTop: 8,
  },
  documentPlaceholder: {
    alignItems: 'center',
  },
  documentPlaceholderText: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.lightGray,
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.gray,
    lineHeight: 16,
    marginTop: 8,
    fontStyle: 'italic',
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
