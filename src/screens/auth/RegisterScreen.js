import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../utils/colors';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    businessAccount: false,
    businessName: '',
    businessType: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRegister = async () => {
    const { firstName, lastName, email, password, confirmPassword, phone } = formData;

    if (!firstName || !lastName || !email || !password || !phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      navigation.navigate('ProfileSetup');
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the MarketPace community</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.row}>
          <View style={[styles.inputContainer, styles.halfWidth]}>
            <Ionicons name="person-outline" size={20} color={colors.gray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={formData.firstName}
              onChangeText={(value) => handleInputChange('firstName', value)}
            />
          </View>
          <View style={[styles.inputContainer, styles.halfWidth]}>
            <Ionicons name="person-outline" size={20} color={colors.gray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={formData.lastName}
              onChangeText={(value) => handleInputChange('lastName', value)}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={colors.gray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color={colors.gray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={formData.phone}
            onChangeText={(value) => handleInputChange('phone', value)}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.gray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.gray} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
            secureTextEntry
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Business Account</Text>
          <Switch
            value={formData.businessAccount}
            onValueChange={(value) => handleInputChange('businessAccount', value)}
            trackColor={{ false: colors.lightGray, true: colors.primary }}
            thumbColor={formData.businessAccount ? colors.white : colors.gray}
          />
        </View>

        {formData.businessAccount && (
          <>
            <View style={styles.inputContainer}>
              <Ionicons name="business-outline" size={20} color={colors.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Business Name"
                value={formData.businessName}
                onChangeText={(value) => handleInputChange('businessName', value)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="storefront-outline" size={20} color={colors.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Business Type"
                value={formData.businessType}
                onChangeText={(value) => handleInputChange('businessType', value)}
              />
            </View>
          </>
        )}

        <TouchableOpacity 
          style={[styles.button, styles.primaryButton, loading && styles.buttonDisabled]} 
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Already have an account?{' '}
          <Text style={styles.linkText} onPress={() => navigation.navigate('Login')}>
            Sign in
          </Text>
        </Text>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 16,
    backgroundColor: colors.white,
  },
  halfWidth: {
    width: '48%',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 5,
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  button: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.gray,
  },
  linkText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
