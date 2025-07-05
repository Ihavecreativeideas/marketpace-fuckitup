import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

export default function DriverApplication({ navigation }: any) {
  const [formData, setFormData] = useState({
    licenseNumber: '',
    vehicleInfo: {
      make: '',
      model: '',
      year: '',
      plate: '',
      color: '',
    },
  });
  const [documents, setDocuments] = useState({
    licenseImage: null as any,
    insuranceImage: null as any,
    backgroundCheck: null as any,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: existingApplication } = useQuery({
    queryKey: ['/api/driver-application'],
    queryFn: () => apiRequest('GET', '/api/driver-application'),
    enabled: !!user,
  });

  const submitApplicationMutation = useMutation({
    mutationFn: async (applicationData: any) => {
      return apiRequest('POST', '/api/driver-application', applicationData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/driver-application'] });
      toast({
        title: 'Application Submitted',
        description: 'Your driver application has been submitted for review',
        variant: 'success',
      });
      navigation.goBack();
    },
    onError: (error) => {
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit driver application. Please try again.',
        variant: 'error',
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('vehicle.')) {
      const vehicleField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        vehicleInfo: {
          ...prev.vehicleInfo,
          [vehicleField]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleDocumentUpload = async (type: 'licenseImage' | 'insuranceImage' | 'backgroundCheck') => {
    try {
      if (type === 'backgroundCheck') {
        const result = await DocumentPicker.getDocumentAsync({
          type: 'application/pdf',
          copyToCacheDirectory: true,
        });
        
        if (!result.canceled) {
          setDocuments(prev => ({
            ...prev,
            [type]: result.assets[0],
          }));
        }
      } else {
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
        });

        if (!result.canceled) {
          setDocuments(prev => ({
            ...prev,
            [type]: result.assets[0],
          }));
        }
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload document. Please try again.',
        variant: 'error',
      });
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.licenseNumber.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Driver license number is required',
        variant: 'error',
      });
      return;
    }

    if (!formData.vehicleInfo.make || !formData.vehicleInfo.model || !formData.vehicleInfo.year) {
      toast({
        title: 'Missing Information',
        description: 'Vehicle information is required',
        variant: 'error',
      });
      return;
    }

    if (!documents.licenseImage || !documents.insuranceImage || !documents.backgroundCheck) {
      toast({
        title: 'Missing Documents',
        description: 'All required documents must be uploaded',
        variant: 'error',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real app, you would upload the files to a cloud storage service
      // For now, we'll simulate the upload URLs
      const applicationData = {
        ...formData,
        licenseImageUrl: 'https://example.com/license.jpg', // Would be actual upload URL
        insuranceImageUrl: 'https://example.com/insurance.jpg', // Would be actual upload URL
        backgroundCheckUrl: 'https://example.com/background.pdf', // Would be actual upload URL
      };

      await submitApplicationMutation.mutateAsync(applicationData);
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDocumentUpload = (
    type: 'licenseImage' | 'insuranceImage' | 'backgroundCheck',
    title: string,
    description: string,
    icon: string
  ) => (
    <Card style={styles.documentCard}>
      <View style={styles.documentHeader}>
        <Ionicons name={icon as any} size={24} color="#007AFF" />
        <View style={styles.documentInfo}>
          <Text style={styles.documentTitle}>{title}</Text>
          <Text style={styles.documentDescription}>{description}</Text>
        </View>
      </View>
      
      {documents[type] ? (
        <View style={styles.uploadedDocument}>
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          <Text style={styles.uploadedText}>
            {documents[type].name || 'Document uploaded'}
          </Text>
          <TouchableOpacity onPress={() => handleDocumentUpload(type)}>
            <Text style={styles.replaceText}>Replace</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Button
          title="Upload Document"
          onPress={() => handleDocumentUpload(type)}
          variant="outline"
          size="small"
        />
      )}
    </Card>
  );

  if (existingApplication) {
    return (
      <ScrollView style={styles.container}>
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons name="car" size={32} color="#007AFF" />
            <Text style={styles.statusTitle}>Driver Application</Text>
          </View>
          
          <View style={styles.statusInfo}>
            <Text style={styles.statusLabel}>Application Status</Text>
            <Badge 
              text={existingApplication.status} 
              variant={
                existingApplication.status === 'approved' ? 'success' :
                existingApplication.status === 'rejected' ? 'error' : 'warning'
              }
              size="large"
            />
          </View>

          <Text style={styles.statusMessage}>
            {existingApplication.status === 'pending' && 
              'Your application is under review. We will notify you once it has been processed.'}
            {existingApplication.status === 'approved' && 
              'Congratulations! Your driver application has been approved. You can now start accepting delivery requests.'}
            {existingApplication.status === 'rejected' && 
              'Your application was not approved. Please contact support for more information.'}
          </Text>

          <Text style={styles.submissionDate}>
            Submitted: {new Date(existingApplication.createdAt).toLocaleDateString()}
          </Text>

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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <View style={styles.headerContent}>
          <Ionicons name="car" size={48} color="#007AFF" />
          <Text style={styles.headerTitle}>Become a MarketPace Driver</Text>
          <Text style={styles.headerSubtitle}>
            Join our delivery network and start earning money on your schedule
          </Text>
        </View>
      </Card>

      {/* Requirements */}
      <Card style={styles.requirementsCard}>
        <Text style={styles.sectionTitle}>Requirements</Text>
        <View style={styles.requirementsList}>
          <View style={styles.requirement}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.requirementText}>Valid driver's license</Text>
          </View>
          <View style={styles.requirement}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.requirementText}>Proof of car insurance</Text>
          </View>
          <View style={styles.requirement}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.requirementText}>Clean background check</Text>
          </View>
          <View style={styles.requirement}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.requirementText}>Reliable vehicle</Text>
          </View>
        </View>
        
        <Text style={styles.independentContractorNote}>
          <Text style={styles.boldText}>Note:</Text> Drivers are independent contractors responsible for their own background checks, insurance, and vehicle maintenance.
        </Text>
      </Card>

      {/* Driver Information */}
      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>Driver Information</Text>
        
        <Input
          label="Driver License Number"
          value={formData.licenseNumber}
          onChangeText={(value) => handleInputChange('licenseNumber', value)}
          placeholder="Enter your license number"
        />
      </Card>

      {/* Vehicle Information */}
      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>Vehicle Information</Text>
        
        <View style={styles.vehicleForm}>
          <View style={styles.vehicleRow}>
            <Input
              label="Make"
              value={formData.vehicleInfo.make}
              onChangeText={(value) => handleInputChange('vehicle.make', value)}
              placeholder="e.g., Toyota"
              containerStyle={styles.halfInput}
            />
            <Input
              label="Model"
              value={formData.vehicleInfo.model}
              onChangeText={(value) => handleInputChange('vehicle.model', value)}
              placeholder="e.g., Camry"
              containerStyle={styles.halfInput}
            />
          </View>
          
          <View style={styles.vehicleRow}>
            <Input
              label="Year"
              value={formData.vehicleInfo.year}
              onChangeText={(value) => handleInputChange('vehicle.year', value)}
              placeholder="e.g., 2020"
              keyboardType="numeric"
              containerStyle={styles.halfInput}
            />
            <Input
              label="Color"
              value={formData.vehicleInfo.color}
              onChangeText={(value) => handleInputChange('vehicle.color', value)}
              placeholder="e.g., Black"
              containerStyle={styles.halfInput}
            />
          </View>
          
          <Input
            label="License Plate"
            value={formData.vehicleInfo.plate}
            onChangeText={(value) => handleInputChange('vehicle.plate', value)}
            placeholder="Enter license plate number"
          />
        </View>
      </Card>

      {/* Document Uploads */}
      <View style={styles.documentsSection}>
        <Text style={styles.sectionTitle}>Required Documents</Text>
        
        {renderDocumentUpload(
          'licenseImage',
          'Driver License',
          'Clear photo of your valid driver license',
          'card'
        )}
        
        {renderDocumentUpload(
          'insuranceImage',
          'Car Insurance',
          'Proof of current auto insurance coverage',
          'shield'
        )}
        
        {renderDocumentUpload(
          'backgroundCheck',
          'Background Check',
          'You must provide and pay for your own background check',
          'document-text'
        )}
      </View>

      {/* Background Check Info */}
      <Card style={styles.backgroundCheckInfo}>
        <View style={styles.infoHeader}>
          <Ionicons name="information-circle" size={24} color="#FF9800" />
          <Text style={styles.infoTitle}>Background Check Requirements</Text>
        </View>
        <Text style={styles.infoText}>
          You are responsible for obtaining and paying for your own background check. 
          We recommend using services like Checkr or GoodHire. The background check 
          must meet Uber Eats standards and be dated within the last 30 days.
        </Text>
      </Card>

      {/* Submit Button */}
      <Button
        title="Submit Application"
        onPress={handleSubmit}
        loading={isSubmitting}
        disabled={isSubmitting}
        style={styles.submitButton}
      />

      {/* Immediate Hire Note */}
      <Card style={styles.immediateHireCard}>
        <Ionicons name="flash" size={24} color="#4CAF50" />
        <Text style={styles.immediateHireText}>
          <Text style={styles.boldText}>Immediate Hire Program:</Text> Once all documents 
          are verified and background check passes, you'll receive login credentials 
          and can start driving immediately!
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerCard: {
    margin: 16,
    backgroundColor: '#007AFF',
  },
  headerContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  requirementsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  requirementsList: {
    marginBottom: 16,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requirementText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  independentContractorNote: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
  },
  boldText: {
    fontWeight: 'bold',
  },
  formCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  vehicleForm: {
    marginTop: -8,
  },
  vehicleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  documentsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  documentCard: {
    marginBottom: 12,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  documentDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  uploadedDocument: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
  },
  uploadedText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  replaceText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  backgroundCheckInfo: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff8e1',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  submitButton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  immediateHireCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#f0f8ff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  immediateHireText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
  statusCard: {
    margin: 16,
    alignItems: 'center',
    paddingVertical: 30,
  },
  statusHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  statusInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  statusMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  submissionDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  dashboardButton: {
    minWidth: 200,
  },
});
