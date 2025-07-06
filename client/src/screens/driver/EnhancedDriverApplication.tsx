import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
// Simplified for demo
const useQuery = (config: any) => ({ data: null, isLoading: false, error: null });
const useMutation = (config: any) => ({ mutate: () => {}, isLoading: false });
const useQueryClient = () => ({ invalidateQueries: () => {} });
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';

interface DriverApplicationData {
  licenseNumber: string;
  licenseExpirationDate: string;
  insuranceCompany: string;
  insurancePolicyNumber: string;
  insuranceExpirationDate: string;
  backgroundCheckProvider: string;
  backgroundCheckDate: string;
  backgroundCheckPassed: boolean;
  vehicleInfo: {
    make: string;
    model: string;
    year: string;
    color: string;
    plate: string;
  };
  bankAccountNumber: string;
  bankRoutingNumber: string;
}

interface DocumentState {
  licenseImage: any;
  insuranceImage: any;
  backgroundCheck: any;
}

export default function EnhancedDriverApplication({ navigation }: any) {
  const [formData, setFormData] = useState<DriverApplicationData>({
    licenseNumber: '',
    licenseExpirationDate: '',
    insuranceCompany: '',
    insurancePolicyNumber: '',
    insuranceExpirationDate: '',
    backgroundCheckProvider: '',
    backgroundCheckDate: '',
    backgroundCheckPassed: false,
    vehicleInfo: {
      make: '',
      model: '',
      year: '',
      color: '',
      plate: '',
    },
    bankAccountNumber: '',
    bankRoutingNumber: '',
  });

  const [documents, setDocuments] = useState<DocumentState>({
    licenseImage: null,
    insuranceImage: null,
    backgroundCheck: null,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: existingApplication } = useQuery({
    queryKey: ['/api/driver-application'],
    queryFn: () => apiRequest('GET', '/api/driver-application'),
    enabled: !!user,
  });

  const submitApplication = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/driver-application', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/driver-application'] });
      Alert.alert(
        'Application Submitted!',
        'Your driver application has been submitted. You should receive approval within minutes if all documents meet our standards.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to submit application');
    },
  });

  const pickDocument = async (type: keyof DocumentState) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setDocuments(prev => ({
          ...prev,
          [type]: result.assets[0],
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const pickImage = async (type: keyof DocumentState) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setDocuments(prev => ({
          ...prev,
          [type]: result.assets[0],
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.licenseNumber &&
          formData.licenseExpirationDate &&
          documents.licenseImage
        );
      case 2:
        return (
          formData.insuranceCompany &&
          formData.insurancePolicyNumber &&
          formData.insuranceExpirationDate &&
          documents.insuranceImage
        );
      case 3:
        return (
          formData.backgroundCheckProvider &&
          formData.backgroundCheckDate &&
          formData.backgroundCheckPassed &&
          documents.backgroundCheck
        );
      case 4:
        return (
          formData.vehicleInfo.make &&
          formData.vehicleInfo.model &&
          formData.vehicleInfo.year &&
          formData.vehicleInfo.color &&
          formData.vehicleInfo.plate
        );
      case 5:
        return (
          formData.bankAccountNumber &&
          formData.bankRoutingNumber
        );
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    } else {
      Alert.alert('Missing Information', 'Please complete all required fields before continuing.');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // In a real app, you'd upload documents to a file storage service first
      const applicationData = {
        ...formData,
        documentsUploaded: true,
        // In production, you'd have actual URLs here
        licenseImageUrl: documents.licenseImage?.uri || '',
        insuranceImageUrl: documents.insuranceImage?.uri || '',
        backgroundCheckUrl: documents.backgroundCheck?.uri || '',
      };

      await submitApplication.mutateAsync(applicationData);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (existingApplication) {
    return (
      <ScrollView style={styles.container}>
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons 
              name={existingApplication.status === 'approved' ? 'checkmark-circle' : 
                    existingApplication.status === 'rejected' ? 'close-circle' : 'time'} 
              size={48} 
              color={existingApplication.status === 'approved' ? '#4CAF50' : 
                     existingApplication.status === 'rejected' ? '#F44336' : '#FF9800'} 
            />
            <Text style={styles.statusTitle}>
              Application {existingApplication.status === 'approved' ? 'Approved!' : 
                         existingApplication.status === 'rejected' ? 'Rejected' : 'Under Review'}
            </Text>
            {existingApplication.status === 'approved' && (
              <Text style={styles.statusMessage}>
                Welcome to the MarketPace driver network! You can now start accepting delivery routes.
              </Text>
            )}
            {existingApplication.status === 'rejected' && (
              <Text style={styles.statusMessage}>
                {existingApplication.rejectionReason || 'Please check your documents and reapply.'}
              </Text>
            )}
            {existingApplication.status === 'pending' && (
              <Text style={styles.statusMessage}>
                Your application is being reviewed. This typically takes just a few minutes.
              </Text>
            )}
            <Badge 
              text={existingApplication.status} 
              variant={
                existingApplication.status === 'approved' ? 'success' :
                existingApplication.status === 'rejected' ? 'error' : 'warning'
              } 
            />
          </View>
          
          {existingApplication.status === 'approved' && (
            <Button
              title="Go to Driver Dashboard"
              onPress={() => navigation.navigate('DriverDashboard')}
              style={styles.dashboardButton}
            />
          )}
        </Card>
      </ScrollView>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderLicenseStep();
      case 2:
        return renderInsuranceStep();
      case 3:
        return renderBackgroundCheckStep();
      case 4:
        return renderVehicleStep();
      case 5:
        return renderBankingStep();
      default:
        return null;
    }
  };

  const renderLicenseStep = () => (
    <Card style={styles.stepCard}>
      <Text style={styles.stepTitle}>Driver's License Information</Text>
      <Text style={styles.stepDescription}>
        We need to verify your valid driver's license. Must be unexpired and in good standing.
      </Text>
      
      <Input
        label="License Number"
        value={formData.licenseNumber}
        onChangeText={(text) => setFormData(prev => ({ ...prev, licenseNumber: text }))}
        placeholder="Enter your license number"
        style={styles.input}
      />
      
      <Input
        label="License Expiration Date"
        value={formData.licenseExpirationDate}
        onChangeText={(text) => setFormData(prev => ({ ...prev, licenseExpirationDate: text }))}
        placeholder="MM/DD/YYYY"
        style={styles.input}
      />
      
      <TouchableOpacity style={styles.documentButton} onPress={() => pickImage('licenseImage')}>
        <Ionicons name="camera" size={24} color="#007AFF" />
        <Text style={styles.documentButtonText}>
          {documents.licenseImage ? 'License Photo Uploaded ✓' : 'Upload License Photo'}
        </Text>
      </TouchableOpacity>
    </Card>
  );

  const renderInsuranceStep = () => (
    <Card style={styles.stepCard}>
      <Text style={styles.stepTitle}>Auto Insurance Information</Text>
      <Text style={styles.stepDescription}>
        Valid auto insurance is required. Your policy must be current and in good standing.
      </Text>
      
      <Input
        label="Insurance Company"
        value={formData.insuranceCompany}
        onChangeText={(text) => setFormData(prev => ({ ...prev, insuranceCompany: text }))}
        placeholder="e.g., State Farm, Geico, Allstate"
        style={styles.input}
      />
      
      <Input
        label="Policy Number"
        value={formData.insurancePolicyNumber}
        onChangeText={(text) => setFormData(prev => ({ ...prev, insurancePolicyNumber: text }))}
        placeholder="Enter policy number"
        style={styles.input}
      />
      
      <Input
        label="Insurance Expiration Date"
        value={formData.insuranceExpirationDate}
        onChangeText={(text) => setFormData(prev => ({ ...prev, insuranceExpirationDate: text }))}
        placeholder="MM/DD/YYYY"
        style={styles.input}
      />
      
      <TouchableOpacity style={styles.documentButton} onPress={() => pickImage('insuranceImage')}>
        <Ionicons name="shield-checkmark" size={24} color="#007AFF" />
        <Text style={styles.documentButtonText}>
          {documents.insuranceImage ? 'Insurance Card Uploaded ✓' : 'Upload Insurance Card'}
        </Text>
      </TouchableOpacity>
    </Card>
  );

  const renderBackgroundCheckStep = () => (
    <Card style={styles.stepCard}>
      <Text style={styles.stepTitle}>Background Check</Text>
      <Text style={styles.stepDescription}>
        Upload a background check that meets Uber Eats standards. Must be dated within the last 12 months.
      </Text>
      
      <Input
        label="Background Check Provider"
        value={formData.backgroundCheckProvider}
        onChangeText={(text) => setFormData(prev => ({ ...prev, backgroundCheckProvider: text }))}
        placeholder="e.g., Checkr, Sterling, First Advantage"
        style={styles.input}
      />
      
      <Input
        label="Background Check Date"
        value={formData.backgroundCheckDate}
        onChangeText={(text) => setFormData(prev => ({ ...prev, backgroundCheckDate: text }))}
        placeholder="MM/DD/YYYY"
        style={styles.input}
      />
      
      <TouchableOpacity 
        style={[styles.checkboxRow, formData.backgroundCheckPassed && styles.checkboxRowActive]}
        onPress={() => setFormData(prev => ({ ...prev, backgroundCheckPassed: !prev.backgroundCheckPassed }))}
      >
        <Ionicons 
          name={formData.backgroundCheckPassed ? 'checkbox' : 'square-outline'} 
          size={24} 
          color={formData.backgroundCheckPassed ? '#4CAF50' : '#666'} 
        />
        <Text style={styles.checkboxText}>
          I confirm that my background check passed Uber Eats standards
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.documentButton} onPress={() => pickDocument('backgroundCheck')}>
        <Ionicons name="document-text" size={24} color="#007AFF" />
        <Text style={styles.documentButtonText}>
          {documents.backgroundCheck ? 'Background Check Uploaded ✓' : 'Upload Background Check'}
        </Text>
      </TouchableOpacity>
    </Card>
  );

  const renderVehicleStep = () => (
    <Card style={styles.stepCard}>
      <Text style={styles.stepTitle}>Vehicle Information</Text>
      <Text style={styles.stepDescription}>
        Tell us about the vehicle you'll use for deliveries.
      </Text>
      
      <Input
        label="Make"
        value={formData.vehicleInfo.make}
        onChangeText={(text) => setFormData(prev => ({ 
          ...prev, 
          vehicleInfo: { ...prev.vehicleInfo, make: text }
        }))}
        placeholder="e.g., Toyota, Honda, Ford"
        style={styles.input}
      />
      
      <Input
        label="Model"
        value={formData.vehicleInfo.model}
        onChangeText={(text) => setFormData(prev => ({ 
          ...prev, 
          vehicleInfo: { ...prev.vehicleInfo, model: text }
        }))}
        placeholder="e.g., Camry, Civic, Focus"
        style={styles.input}
      />
      
      <Input
        label="Year"
        value={formData.vehicleInfo.year}
        onChangeText={(text) => setFormData(prev => ({ 
          ...prev, 
          vehicleInfo: { ...prev.vehicleInfo, year: text }
        }))}
        placeholder="e.g., 2020"
        style={styles.input}
      />
      
      <Input
        label="Color"
        value={formData.vehicleInfo.color}
        onChangeText={(text) => setFormData(prev => ({ 
          ...prev, 
          vehicleInfo: { ...prev.vehicleInfo, color: text }
        }))}
        placeholder="e.g., Red, Blue, White"
        style={styles.input}
      />
      
      <Input
        label="License Plate"
        value={formData.vehicleInfo.plate}
        onChangeText={(text) => setFormData(prev => ({ 
          ...prev, 
          vehicleInfo: { ...prev.vehicleInfo, plate: text }
        }))}
        placeholder="Enter license plate number"
        style={styles.input}
      />
    </Card>
  );

  const renderBankingStep = () => (
    <Card style={styles.stepCard}>
      <Text style={styles.stepTitle}>Banking Information</Text>
      <Text style={styles.stepDescription}>
        Enter your bank account details for instant payment after each completed route.
      </Text>
      
      <Input
        label="Bank Account Number"
        value={formData.bankAccountNumber}
        onChangeText={(text) => setFormData(prev => ({ ...prev, bankAccountNumber: text }))}
        placeholder="Enter account number"
        keyboardType="numeric"
        style={styles.input}
      />
      
      <Input
        label="Bank Routing Number"
        value={formData.bankRoutingNumber}
        onChangeText={(text) => setFormData(prev => ({ ...prev, bankRoutingNumber: text }))}
        placeholder="Enter routing number"
        keyboardType="numeric"
        style={styles.input}
      />
      
      <View style={styles.securityNote}>
        <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
        <Text style={styles.securityText}>
          Your banking information is encrypted and secure. We use bank-level security.
        </Text>
      </View>
    </Card>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <View style={styles.headerContent}>
            <Ionicons name="car" size={48} color="#007AFF" />
            <Text style={styles.headerTitle}>Become a MarketPace Driver</Text>
            <Text style={styles.headerSubtitle}>
              Quick approval process - start earning in minutes!
            </Text>
          </View>
        </Card>

        {/* Progress Indicator */}
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Step {currentStep} of 5</Text>
            <Text style={styles.progressDescription}>
              {currentStep === 1 ? 'Driver\'s License' :
               currentStep === 2 ? 'Auto Insurance' :
               currentStep === 3 ? 'Background Check' :
               currentStep === 4 ? 'Vehicle Information' : 'Banking Details'}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(currentStep / 5) * 100}%` }]} />
          </View>
        </Card>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <View style={styles.buttonRow}>
          {currentStep > 1 && (
            <Button
              title="Previous"
              onPress={() => setCurrentStep(currentStep - 1)}
              variant="outline"
              style={styles.navButton}
            />
          )}
          <Button
            title={currentStep === 5 ? 'Submit Application' : 'Next'}
            onPress={handleNext}
            loading={isSubmitting}
            disabled={!validateCurrentStep()}
            style={[styles.navButton, styles.primaryButton]}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  headerCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  headerContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  progressCard: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  progressHeader: {
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  progressDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e1e8ed',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  stepCard: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  input: {
    marginBottom: 16,
  },
  documentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    marginVertical: 8,
  },
  documentButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    marginVertical: 8,
  },
  checkboxRowActive: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4CAF50',
  },
  checkboxText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    marginTop: 16,
  },
  securityText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#4CAF50',
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  navButton: {
    flex: 1,
  },
  primaryButton: {
    minWidth: 120,
  },
  statusCard: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  statusHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  statusMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
    lineHeight: 22,
  },
  dashboardButton: {
    marginTop: 20,
  },
});