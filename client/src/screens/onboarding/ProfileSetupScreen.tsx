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
import ScrollableFuturisticBackground from '../../components/ScrollableFuturisticBackground';
import FuturisticLogo from '../../components/FuturisticLogo';
import GlassCard from '../../components/GlassCard';
import FuturisticButton from '../../components/FuturisticButton';
import { colors } from '../../../../src/utils/colors';

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
    <ScrollableFuturisticBackground>
      <SafeAreaView style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
          showsVerticalScrollIndicator={true}
          bounces={true}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
          scrollEnabled={true}
          alwaysBounceVertical={true}
          removeClippedSubviews={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Your Profile</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Logo */}
          <FuturisticLogo size="small" animated={true} />

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressStep, styles.progressActive]} />
            <View style={styles.progressStep} />
            <View style={styles.progressStep} />
          </View>
          <Text style={styles.progressText}>Step 1 of 3</Text>

          {/* Profile Picture */}
          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>Profile Picture</Text>
            <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={32} color={colors.textMuted} />
                  <Text style={styles.imagePlaceholderText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </GlassCard>

          {/* Bio */}
          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>Tell us about yourself</Text>
            <TextInput
              style={styles.bioInput}
              placeholder="Write a short bio about yourself..."
              placeholderTextColor={colors.textMuted}
              value={formData.bio}
              onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
              multiline
              maxLength={200}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>{formData.bio.length}/200</Text>
          </GlassCard>

          {/* Interests */}
          <GlassCard style={styles.section}>
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
          </GlassCard>

          {/* Contact Info */}
          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="call" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor={colors.textMuted}
                value={formData.phoneNumber}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phoneNumber: text }))}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="location" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Your Address"
                placeholderTextColor={colors.textMuted}
                value={formData.address}
                onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                multiline
              />
            </View>
          </GlassCard>

          {/* Continue Button */}
          <FuturisticButton
            title="Continue"
            onPress={handleNext}
            loading={loading}
            variant="primary"
            size="large"
            glowEffect={true}
            style={styles.continueButton}
          />
        </ScrollView>
      </SafeAreaView>
    </ScrollableFuturisticBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 150, // Extra padding at bottom to ensure scrolling to end
    minHeight: '100%',
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
    color: colors.text,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
    marginTop: 10,
  },
  progressStep: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.cosmic.glass.medium,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  progressText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 30,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  imageContainer: {
    alignSelf: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.primary,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.cosmic.glass.medium,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textMuted,
  },
  bioInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    height: 100,
    fontSize: 16,
    backgroundColor: colors.cosmic.glass.medium,
    color: colors.text,
    textAlignVertical: 'top',
  },
  characterCount: {
    textAlign: 'right',
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cosmic.glass.medium,
  },
  interestTagSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  interestTagText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  interestTagTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.cosmic.glass.medium,
    marginBottom: 12,
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  continueButton: {
    marginTop: 30,
    marginBottom: 20,
  },
});