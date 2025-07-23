import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../utils/colors';

export default function ProfileSetupScreen({ navigation }) {
  const [profileData, setProfileData] = useState({
    profileImage: null,
    bio: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    interests: [],
  });
  const [loading, setLoading] = useState(false);
  const { updateProfile } = useAuth();

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileData(prev => ({
        ...prev,
        profileImage: result.assets[0].uri,
      }));
    }
  };

  const handleCompleteProfile = async () => {
    const { address, city, state, zipCode } = profileData;

    if (!address || !city || !state || !zipCode) {
      Alert.alert('Error', 'Please fill in all address fields');
      return;
    }

    setLoading(true);
    try {
      // Update member profile first
      await updateProfile(profileData);
      
      // Generate automatic Geo QR code for member's address
      await generateMemberGeoQR();
      
      Alert.alert('Success', 'Profile setup completed with Geo QR code generated for your address!');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateMemberGeoQR = async () => {
    try {
      const { address, city, state, zipCode, bio } = profileData;
      const memberId = 'member_' + Math.random().toString(36).substr(2, 9); // In real app, get from auth context
      
      const response = await fetch('http://localhost:5000/api/members/generate-address-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId: memberId,
          address: address,
          city: city,
          state: state,
          zipCode: zipCode,
          memberName: bio ? bio.split(' ').slice(0, 2).join(' ') : 'MarketPace Member'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Store QR data locally for marketplace use
        const qrData = data.qrData;
        console.log('✅ Member Geo QR generated:', qrData.id);
        
        // In a real app, store in AsyncStorage or state management
        // This QR can be used for buying, selling, renting, service booking
        
        return qrData;
      } else {
        console.warn('⚠️ Geo QR generation failed:', data.message);
      }
    } catch (error) {
      console.error('❌ Error generating member Geo QR:', error);
      // Don't fail profile setup if QR generation fails
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Profile Setup',
      'You can complete your profile later in settings. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip', onPress: () => navigation.navigate('Home') },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>Help others get to know you better</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
            {profileData.profileImage ? (
              <Image source={{ uri: profileData.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="camera" size={40} color={colors.gray} />
                <Text style={styles.imageText}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="document-text-outline" size={20} color={colors.gray} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell us about yourself (bio)"
            value={profileData.bio}
            onChangeText={(value) => handleInputChange('bio', value)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <Text style={styles.sectionTitle}>Address Information</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="location-outline" size={20} color={colors.gray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Street Address"
            value={profileData.address}
            onChangeText={(value) => handleInputChange('address', value)}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputContainer, styles.cityInput]}>
            <Ionicons name="business-outline" size={20} color={colors.gray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="City"
              value={profileData.city}
              onChangeText={(value) => handleInputChange('city', value)}
            />
          </View>
          <View style={[styles.inputContainer, styles.stateInput]}>
            <TextInput
              style={styles.input}
              placeholder="State"
              value={profileData.state}
              onChangeText={(value) => handleInputChange('state', value)}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={colors.gray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="ZIP Code"
            value={profileData.zipCode}
            onChangeText={(value) => handleInputChange('zipCode', value)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]} 
            onPress={handleCompleteProfile}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Saving...' : 'Complete Profile'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleSkip}>
            <Text style={styles.secondaryButtonText}>Skip for Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
  },
  form: {
    marginBottom: 30,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  imageButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    color: colors.gray,
    fontSize: 12,
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 16,
    backgroundColor: colors.white,
  },
  inputIcon: {
    marginRight: 10,
    marginTop: 15,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    paddingTop: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
    marginTop: 10,
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
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: colors.gray,
    fontSize: 16,
    fontWeight: '600',
  },
});
