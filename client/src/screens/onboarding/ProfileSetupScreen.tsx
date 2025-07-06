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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../hooks/useAuth';
import { useApiRequest } from '../../hooks/useApiRequest';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Colors } from '../../constants/Colors';

interface ProfileSetupData {
  profileImageUrl?: string;
  bio: string;
  interests: string[];
  phoneNumber: string;
  address: string;
}

const INTEREST_OPTIONS = [
  'Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Art & Crafts',
  'Automotive', 'Baby & Kids', 'Health & Beauty', 'Music', 'Gaming', 'Tools',
  'Furniture', 'Jewelry', 'Photography', 'Cooking', 'Travel', 'Fitness',
  'Technology', 'Collectibles', 'Vintage', 'Handmade', 'Services', 'Events'
];

export default function ProfileSetupScreen({ navigation }: any) {
  const [formData, setFormData] = useState<ProfileSetupData>({
    bio: '',
    interests: [],
    phoneNumber: '',
    address: '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { apiRequest } = useApiRequest();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleNext = async () => {
    if (!formData.bio.trim() || formData.interests.length === 0) {
      Alert.alert('Required Fields', 'Please add a bio and select at least one interest');
      return;
    }

    if (!formData.phoneNumber.trim() || !formData.address.trim()) {
      Alert.alert('Required Fields', 'Please provide your phone number and address');
      return;
    }

    setLoading(true);
    try {
      // Update user profile with basic info
      await apiRequest('PATCH', '/api/auth/profile', {
        ...formData,
        profileImageUrl: profileImage,
      });

      navigation.navigate('AccountTypeSelection');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save profile');
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
          <Text style={styles.headerTitle}>Create Your Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressStep, styles.progressActive]} />
          <View style={styles.progressStep} />
          <View style={styles.progressStep} />
        </View>
        <Text style={styles.progressText}>Step 1 of 3</Text>

        {/* Profile Picture */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Picture</Text>
          <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera" size={32} color={Colors.gray} />
                <Text style={styles.imagePlaceholderText}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </Card>

        {/* Bio */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Tell us about yourself</Text>
          <TextInput
            style={styles.bioInput}
            placeholder="Write a short bio about yourself..."
            value={formData.bio}
            onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
            multiline
            maxLength={200}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>{formData.bio.length}/200</Text>
        </Card>

        {/* Interests */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>What are you interested in?</Text>
          <Text style={styles.sectionDescription}>
            Select categories that interest you (choose at least 3)
          </Text>
          <View style={styles.interestsGrid}>
            {INTEREST_OPTIONS.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.interestTag,
                  formData.interests.includes(interest) && styles.interestTagSelected
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text style={[
                  styles.interestTagText,
                  formData.interests.includes(interest) && styles.interestTagTextSelected
                ]}>
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Contact Info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.inputContainer}>
            <Ionicons name="call" size={20} color={Colors.gray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phoneNumber: text }))}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="location" size={20} color={Colors.gray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Your Address"
              value={formData.address}
              onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
              multiline
            />
          </View>
        </Card>

        {/* Continue Button */}
        <Button
          title="Continue"
          onPress={handleNext}
          loading={loading}
          style={styles.continueButton}
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
  imageContainer: {
    alignSelf: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.gray,
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
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'white',
  },
  interestTagSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  interestTagText: {
    fontSize: 14,
    color: Colors.text,
  },
  interestTagTextSelected: {
    color: 'white',
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
  continueButton: {
    marginTop: 20,
  },
});