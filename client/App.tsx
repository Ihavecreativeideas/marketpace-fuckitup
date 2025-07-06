import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
// Create a simple QueryClient for demo
const QueryClient = () => null;
const QueryClientProvider = ({ children }: { children: React.ReactNode }) => children;
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Create a simple demo auth context with guest mode support
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  onboardingCompleted: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  location: { latitude: number; longitude: number } | null;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
  requestLocationPermission: () => Promise<boolean>;
  showSignUpPrompt: (action: string) => void;
}

const demoUser: User = {
  id: 'demo-user',
  email: 'demo@marketpace.com',
  firstName: 'Demo',
  lastName: 'User',
  userType: 'buyer',
  onboardingCompleted: true,
};

const AuthContext = React.createContext<AuthContextType>({
  user: demoUser,
  isLoading: false,
  isAuthenticated: true,
  isGuest: false,
  location: null,
  enterGuestMode: () => {},
  exitGuestMode: () => {},
  requestLocationPermission: async () => false,
  showSignUpPrompt: () => {},
});

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isGuest, setIsGuest] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [signUpAction, setSignUpAction] = useState('');

  const enterGuestMode = async () => {
    console.log('Entering guest mode...');
    setIsGuest(true);
    // Request location permission for guest users
    await requestLocationPermission();
  };

  const exitGuestMode = () => {
    setIsGuest(false);
    setLocation(null);
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      // For demo purposes, simulate location permission
      // In real app, use expo-location
      console.log('Requesting location permission...');
      // Simulate getting user location (Seattle coordinates for demo)
      setLocation({ latitude: 47.6062, longitude: -122.3321 });
      return true;
    } catch (error) {
      console.error('Location permission denied:', error);
      return false;
    }
  };

  const showSignUpPrompt = (action: string) => {
    setSignUpAction(action);
    setShowSignUpModal(true);
  };

  return (
    <AuthContext.Provider value={{
      user: isGuest ? null : demoUser,
      isLoading: false,
      isAuthenticated: !isGuest,
      isGuest,
      location,
      enterGuestMode,
      exitGuestMode,
      requestLocationPermission,
      showSignUpPrompt,
    }}>
      {children}
      {/* Sign Up Prompt Modal for Guest Users */}
      {showSignUpModal && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <GlassCard style={{ margin: 20, padding: 20, alignItems: 'center' }}>
            <Text style={{ 
              fontSize: 24, 
              fontWeight: 'bold', 
              color: colors.text,
              textAlign: 'center',
              marginBottom: 15
            }}>
              Sign Up Required
            </Text>
            <Text style={{ 
              fontSize: 16, 
              color: colors.textSecondary,
              textAlign: 'center',
              marginBottom: 20
            }}>
              To {signUpAction}, you need to create an account. Join MarketPlace to support your local community!
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <FuturisticButton
                title="Sign Up"
                onPress={() => {
                  setShowSignUpModal(false);
                  // Navigate to sign up
                }}
                variant="primary"
                size="medium"
                glowEffect={true}
              />
              <FuturisticButton
                title="Continue as Guest"
                onPress={() => setShowSignUpModal(false)}
                variant="secondary"
                size="medium"
              />
            </View>
          </GlassCard>
        </View>
      )}
    </AuthContext.Provider>
  );
};

const useAuth = () => React.useContext(AuthContext);

import FuturisticBackground from './src/components/FuturisticBackground';
import FuturisticLogo from './src/components/FuturisticLogo';
import GlassCard from './src/components/GlassCard';
import FuturisticButton from './src/components/FuturisticButton';
import { colors } from '../src/utils/colors';
import { RevenueDashboard } from './src/screens/RevenueDashboard';
import { RevenueDemo } from './src/components/revenue/RevenueDemo';
import { SimpleLandingPage } from './src/screens/SimpleLandingPage';

// Simple placeholder screens to prevent import errors

const SimpleScreen = ({ title }: { title: string }) => (
  <FuturisticBackground>
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <FuturisticLogo size="medium" animated={true} />
      <GlassCard style={{ marginTop: 30, alignItems: 'center' }}>
        <Text style={{ 
          fontSize: 24, 
          fontWeight: 'bold', 
          color: colors.text,
          textAlign: 'center',
          marginBottom: 15
        }}>
          {title}
        </Text>
        <Text style={{ 
          fontSize: 16, 
          color: colors.textSecondary,
          textAlign: 'center',
          marginBottom: 20
        }}>
          Coming soon with futuristic features
        </Text>
        <FuturisticButton
          title="Explore Features"
          onPress={() => console.log(`${title} features`)}
          variant="primary"
          size="medium"
          glowEffect={true}
        />
      </GlassCard>
    </View>
  </FuturisticBackground>
);

// New onboarding screens
import SimpleProfileSetupScreen from './src/screens/onboarding/SimpleProfileSetupScreen';
import AccountTypeSelectionScreen from './src/screens/onboarding/AccountTypeSelectionScreen';
import BusinessSetupScreen from './src/screens/onboarding/BusinessSetupScreen';
import OnboardingCompleteScreen from './src/screens/onboarding/OnboardingCompleteScreen';

// Delivery and driver screens
import DeliveryHub from './src/screens/DeliveryHub';
import DeliveryTrackingDemo from './src/screens/demo/DeliveryTrackingDemo';
import EnhancedDriverApplication from './src/screens/driver/EnhancedDriverApplication';
import UberEatsStyleDashboard from './src/screens/driver/UberEatsStyleDashboard';
import ProfessionalProfile from './src/screens/ProfessionalProfile';

// Guest mode screens
import GuestLocationSetup from './src/screens/GuestLocationSetup';
import GuestMarketplace from './src/screens/GuestMarketplace';

const queryClient = null; // Simplified for demo
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Sign Up / Login Screen
const SignUpLoginScreen = ({ route, navigation }: any) => {
  const mode = route?.params?.mode || 'signup';
  const isSignUp = mode === 'signup';
  const [showEmailForm, setShowEmailForm] = React.useState(false);
  const [selectedMethod, setSelectedMethod] = React.useState('');
  const { enterGuestMode } = useAuth();

  const handleAuthMethod = async (method: string) => {
    setSelectedMethod(method);
    
    if (method === 'email') {
      setShowEmailForm(true);
    } else if (method === 'guest') {
      // Guest mode - enter guest mode and navigate to location-aware experience
      console.log('Entering guest mode...');
      await enterGuestMode();
      navigation.navigate('GuestLocationSetup');
    } else {
      setShowEmailForm(false);
      // Simulate authentication success for demo
      console.log(`Authenticating with ${method}...`);
      // Navigate to member questionnaire for new sign-ups
      if (isSignUp) {
        navigation.navigate('MemberQuestionnaire', { authMethod: method });
      } else {
        // For login, go back to campaign landing
        navigation.navigate('CampaignLanding');
      }
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{ paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, alignItems: 'center' }}
      >
        <TouchableOpacity 
          style={{ position: 'absolute', left: 20, top: 60, zIndex: 10 }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ fontSize: 24, color: '#fff', fontWeight: 'bold' }}>←</Text>
        </TouchableOpacity>
        
        <View style={{ 
          width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255, 255, 255, 0.2)',
          justifyContent: 'center', alignItems: 'center', marginBottom: 12
        }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>MP</Text>
        </View>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 }}>
          {isSignUp ? 'Join MarketPlace' : 'Welcome Back'}
        </Text>
        {isSignUp && (
          <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center' }}>
            Get lifetime Pro access as an early campaign member
          </Text>
        )}
      </LinearGradient>

      {/* Email Form - Only show when email option is selected */}
      {showEmailForm && (
        <View style={{ padding: 24, backgroundColor: '#fff', margin: 20, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16, textAlign: 'center' }}>
            {isSignUp ? 'Create Your Account' : 'Welcome Back'}
          </Text>
          
          {isSignUp && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 }}>Full Name</Text>
              <View style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' }}>
                <Text style={{ color: '#999' }}>Enter your full name</Text>
              </View>
            </View>
          )}
          
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 }}>Email Address</Text>
            <View style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' }}>
              <Text style={{ color: '#999' }}>Enter your email</Text>
            </View>
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 }}>Password</Text>
            <View style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' }}>
              <Text style={{ color: '#999' }}>Enter your password</Text>
            </View>
          </View>

          {/* Email Submit Button */}
          <TouchableOpacity 
            style={{ width: '100%', marginBottom: 16 }}
            onPress={() => {
              if (isSignUp) {
                navigation.navigate('MemberQuestionnaire', { authMethod: 'email' });
              } else {
                navigation.navigate('CampaignLanding');
              }
            }}
          >
            <LinearGradient
              colors={isSignUp ? ['#4CAF50', '#45a049'] : ['#667eea', '#764ba2']}
              style={{ paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, alignItems: 'center' }}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>
                {isSignUp ? 'Join Campaign & Get Pro Access' : 'Log In'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Back to Options */}
          <TouchableOpacity 
            style={{ paddingVertical: 12, paddingHorizontal: 24, alignItems: 'center' }}
            onPress={() => setShowEmailForm(false)}
          >
            <Text style={{ fontSize: 16, color: '#667eea', textAlign: 'center' }}>
              ← Back to sign-in options
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Auth Method Selection - Only show when email form is not visible */}
      {!showEmailForm && (
        <View style={{ padding: 24 }}>
          {/* Switch Mode */}
          <TouchableOpacity 
            style={{ paddingVertical: 12, paddingHorizontal: 24, alignItems: 'center', marginBottom: 16 }}
            onPress={() => navigation.navigate('SignUpLogin', { mode: isSignUp ? 'login' : 'signup' })}
          >
            <Text style={{ fontSize: 16, color: '#667eea', textAlign: 'center' }}>
              {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Join the campaign"}
            </Text>
          </TouchableOpacity>

          {/* Social Login Options */}
          <View style={{ marginTop: 24 }}>
            <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 16 }}>
              Choose your sign-in method
            </Text>
          
          {/* Guest Mode */}
          <TouchableOpacity 
            style={{ 
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingVertical: 14, marginBottom: 12
            }}
            onPress={() => handleAuthMethod('guest')}
          >
            <Text style={{ fontSize: 20, marginRight: 12 }}>👤</Text>
            <Text style={{ fontSize: 16, color: '#333', fontWeight: '600' }}>Continue as Guest</Text>
            <Text style={{ fontSize: 12, color: '#666', marginLeft: 8 }}>(view only)</Text>
          </TouchableOpacity>

          {/* Google */}
          <TouchableOpacity 
            style={{ 
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingVertical: 14, marginBottom: 12, backgroundColor: '#fff'
            }}
            onPress={() => handleAuthMethod('google')}
          >
            <Text style={{ fontSize: 20, marginRight: 12 }}>🔍</Text>
            <Text style={{ fontSize: 16, color: '#333', fontWeight: '600' }}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Gmail (separate from Google account) */}
          <TouchableOpacity 
            style={{ 
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingVertical: 14, marginBottom: 12, backgroundColor: '#fff'
            }}
            onPress={() => handleAuthMethod('gmail')}
          >
            <Text style={{ fontSize: 20, marginRight: 12 }}>📧</Text>
            <Text style={{ fontSize: 16, color: '#333', fontWeight: '600' }}>Sign in with Gmail</Text>
          </TouchableOpacity>

          {/* Facebook */}
          <TouchableOpacity 
            style={{ 
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              backgroundColor: '#1877F2', borderRadius: 8, paddingVertical: 14, marginBottom: 12
            }}
            onPress={() => handleAuthMethod('facebook')}
          >
            <Text style={{ fontSize: 20, marginRight: 12 }}>📘</Text>
            <Text style={{ fontSize: 16, color: '#fff', fontWeight: '600' }}>Continue with Facebook</Text>
          </TouchableOpacity>

          {/* Apple ID */}
          <TouchableOpacity 
            style={{ 
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              backgroundColor: '#000', borderRadius: 8, paddingVertical: 14, marginBottom: 12
            }}
            onPress={() => handleAuthMethod('apple')}
          >
            <Text style={{ fontSize: 20, marginRight: 12 }}>🍎</Text>
            <Text style={{ fontSize: 16, color: '#fff', fontWeight: '600' }}>Continue with Apple</Text>
          </TouchableOpacity>

          {/* Email Option */}
          <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#eee' }}>
            <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 12 }}>
              Or use email address
            </Text>
            <TouchableOpacity 
              style={{ 
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                borderWidth: 1, borderColor: '#667eea', borderRadius: 8, paddingVertical: 14, backgroundColor: 'rgba(102, 126, 234, 0.05)'
              }}
              onPress={() => handleAuthMethod('email')}
            >
              <Text style={{ fontSize: 20, marginRight: 12 }}>✉️</Text>
              <Text style={{ fontSize: 16, color: '#667eea', fontWeight: '600' }}>
                {isSignUp ? 'Sign up with Email' : 'Log in with Email'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {isSignUp && (
          <View style={{ marginTop: 24, padding: 16, backgroundColor: '#e8f5e8', borderRadius: 8 }}>
            <Text style={{ fontSize: 14, color: '#2e7d32', textAlign: 'center', fontWeight: '600', marginBottom: 4 }}>
              🎁 Campaign Member Benefit
            </Text>
            <Text style={{ fontSize: 12, color: '#2e7d32', textAlign: 'center', lineHeight: 18 }}>
              As an early campaign member, you'll receive lifetime Pro access (normally $3.99/month) completely free!
            </Text>
          </View>
        )}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

// Member Questionnaire Flow
const MemberQuestionnaireScreen = ({ route, navigation }: any) => {
  const authMethod = route?.params?.authMethod || 'unknown';
  const [currentStep, setCurrentStep] = React.useState(1);
  const [profileData, setProfileData] = React.useState({
    bio: '',
    interests: [],
    accountType: '', // 'personal' or 'dual'
    businessType: '', // 'shops', 'services', 'entertainment'
    businessName: '',
    businessDescription: '',
    businessWebsite: '',
    businessPhone: '',
    hasWebsiteIntegration: false
  });

  const interests = [
    'Electronics', 'Clothing', 'Home & Garden', 'Sports & Outdoors', 'Books & Media',
    'Baby & Kids', 'Tools & Equipment', 'Art & Crafts', 'Music & Entertainment',
    'Food & Beverages', 'Health & Beauty', 'Automotive', 'Collectibles',
    'Gaming', 'Photography', 'Fitness', 'Travel', 'Pets', 'Technology', 'Fashion'
  ];

  const toggleInterest = (interest: string) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      console.log('Onboarding complete:', profileData);
      if (profileData.accountType === 'dual') {
        navigation.navigate('ProfessionalProfile');
      } else {
        navigation.navigate('CampaignLanding');
      }
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 8 }}>
              Welcome to MarketPlace! 🎉
            </Text>
            <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 24 }}>
              Let's personalize your experience
            </Text>

            <Text style={{ fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 16 }}>
              Tell us about yourself
            </Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 }}>
                Write a short bio (Optional)
              </Text>
              <TextInput
                style={{ 
                  borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, backgroundColor: '#fff',
                  minHeight: 80, textAlignVertical: 'top'
                }}
                multiline
                placeholder="Tell your neighbors about yourself, your interests, or what you're looking for..."
                placeholderTextColor="#999"
                value={profileData.bio}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, bio: text }))}
              />
            </View>

            <TouchableOpacity 
              style={{ width: '100%' }}
              onPress={nextStep}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={{ paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>
                  Continue
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        );

      case 2:
        return (
          <>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 8 }}>
              What interests you?
            </Text>
            <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 24 }}>
              Select categories you're interested in buying, selling, or exploring
            </Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 }}>
              {interests.map((interest) => (
                <TouchableOpacity
                  key={interest}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 8,
                    marginBottom: 8,
                    backgroundColor: profileData.interests.includes(interest) ? '#667eea' : '#f0f0f0',
                    borderWidth: 1,
                    borderColor: profileData.interests.includes(interest) ? '#667eea' : '#ddd'
                  }}
                  onPress={() => toggleInterest(interest)}
                >
                  <Text style={{
                    color: profileData.interests.includes(interest) ? '#fff' : '#333',
                    fontSize: 14,
                    fontWeight: profileData.interests.includes(interest) ? '600' : '400'
                  }}>
                    {interest}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 20 }}>
              Selected: {profileData.interests.length} interests
            </Text>

            <TouchableOpacity 
              style={{ width: '100%' }}
              onPress={nextStep}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={{ paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>
                  Continue
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        );

      case 3:
        return (
          <>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 8 }}>
              Choose your account type
            </Text>
            <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 24 }}>
              You can always upgrade later
            </Text>

            {/* Personal Account Option */}
            <TouchableOpacity
              style={{
                borderWidth: 2,
                borderColor: profileData.accountType === 'personal' ? '#667eea' : '#ddd',
                borderRadius: 12,
                padding: 20,
                marginBottom: 16,
                backgroundColor: profileData.accountType === 'personal' ? 'rgba(102, 126, 234, 0.05)' : '#fff'
              }}
              onPress={() => setProfileData(prev => ({ ...prev, accountType: 'personal', businessType: '' }))}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 20, marginRight: 12 }}>👤</Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>Personal Account</Text>
              </View>
              <Text style={{ fontSize: 14, color: '#666', lineHeight: 20 }}>
                Perfect for buying, selling personal items, and connecting with neighbors
              </Text>
            </TouchableOpacity>

            {/* Dual Account Option */}
            <TouchableOpacity
              style={{
                borderWidth: 2,
                borderColor: profileData.accountType === 'dual' ? '#667eea' : '#ddd',
                borderRadius: 12,
                padding: 20,
                marginBottom: 20,
                backgroundColor: profileData.accountType === 'dual' ? 'rgba(102, 126, 234, 0.05)' : '#fff'
              }}
              onPress={() => setProfileData(prev => ({ ...prev, accountType: 'dual' }))}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 20, marginRight: 12 }}>💼</Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>Personal + Business</Text>
                <View style={{ backgroundColor: '#ff6b6b', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginLeft: 8 }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>PRO</Text>
                </View>
              </View>
              <Text style={{ fontSize: 14, color: '#666', lineHeight: 20 }}>
                Run a business! Shops, services, or entertainment with advanced features
              </Text>
            </TouchableOpacity>

            {/* Business Type Selection - Only show if dual account selected */}
            {profileData.accountType === 'dual' && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 }}>
                  What type of business?
                </Text>
                
                <TouchableOpacity
                  style={{
                    flexDirection: 'row', alignItems: 'center', padding: 12,
                    borderWidth: 1, borderColor: profileData.businessType === 'shops' ? '#667eea' : '#ddd',
                    borderRadius: 8, marginBottom: 8,
                    backgroundColor: profileData.businessType === 'shops' ? 'rgba(102, 126, 234, 0.05)' : '#fff'
                  }}
                  onPress={() => setProfileData(prev => ({ ...prev, businessType: 'shops' }))}
                >
                  <Text style={{ fontSize: 18, marginRight: 12 }}>🛒</Text>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>Shops</Text>
                    <Text style={{ fontSize: 12, color: '#666' }}>Retail, products, online store</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flexDirection: 'row', alignItems: 'center', padding: 12,
                    borderWidth: 1, borderColor: profileData.businessType === 'services' ? '#667eea' : '#ddd',
                    borderRadius: 8, marginBottom: 8,
                    backgroundColor: profileData.businessType === 'services' ? 'rgba(102, 126, 234, 0.05)' : '#fff'
                  }}
                  onPress={() => setProfileData(prev => ({ ...prev, businessType: 'services' }))}
                >
                  <Text style={{ fontSize: 18, marginRight: 12 }}>🛠️</Text>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>Services</Text>
                    <Text style={{ fontSize: 12, color: '#666' }}>Labor, professional services, handyman</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flexDirection: 'row', alignItems: 'center', padding: 12,
                    borderWidth: 1, borderColor: profileData.businessType === 'entertainment' ? '#667eea' : '#ddd',
                    borderRadius: 8, marginBottom: 16,
                    backgroundColor: profileData.businessType === 'entertainment' ? 'rgba(102, 126, 234, 0.05)' : '#fff'
                  }}
                  onPress={() => setProfileData(prev => ({ ...prev, businessType: 'entertainment' }))}
                >
                  <Text style={{ fontSize: 18, marginRight: 12 }}>🎭</Text>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>Entertainment (The Hub)</Text>
                    <Text style={{ fontSize: 12, color: '#666' }}>DJs, bands, comedians, performers</Text>
                  </View>
                </TouchableOpacity>

                {/* Business Details Form - Only show if business type selected */}
                {profileData.businessType && (
                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 }}>
                      Business Information
                    </Text>

                    <View style={{ marginBottom: 12 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 }}>
                        Business Name (Optional)
                      </Text>
                      <TextInput
                        style={{ 
                          borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, backgroundColor: '#fff'
                        }}
                        placeholder="Enter your business name"
                        placeholderTextColor="#999"
                        value={profileData.businessName}
                        onChangeText={(text) => setProfileData(prev => ({ ...prev, businessName: text }))}
                      />
                    </View>

                    <View style={{ marginBottom: 12 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 }}>
                        Business Website (Optional)
                      </Text>
                      <TextInput
                        style={{ 
                          borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, backgroundColor: '#fff'
                        }}
                        placeholder="https://yourwebsite.com"
                        placeholderTextColor="#999"
                        value={profileData.businessWebsite}
                        onChangeText={(text) => setProfileData(prev => ({ ...prev, businessWebsite: text }))}
                        keyboardType="url"
                        autoCapitalize="none"
                      />
                    </View>

                    <TouchableOpacity
                      style={{
                        flexDirection: 'row', alignItems: 'center', padding: 12,
                        borderWidth: 1, borderColor: profileData.hasWebsiteIntegration ? '#4CAF50' : '#ddd',
                        borderRadius: 8, marginBottom: 12,
                        backgroundColor: profileData.hasWebsiteIntegration ? 'rgba(76, 175, 80, 0.05)' : '#fff'
                      }}
                      onPress={() => setProfileData(prev => ({ ...prev, hasWebsiteIntegration: !prev.hasWebsiteIntegration }))}
                    >
                      <Text style={{ fontSize: 18, marginRight: 12 }}>
                        {profileData.hasWebsiteIntegration ? '✅' : '⬜'}
                      </Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>Website Integration</Text>
                        <Text style={{ fontSize: 12, color: '#666' }}>Sync inventory, orders, and analytics with your existing website</Text>
                      </View>
                    </TouchableOpacity>

                    <View style={{ marginBottom: 12 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 }}>
                        Business Phone (Optional)
                      </Text>
                      <TextInput
                        style={{ 
                          borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, backgroundColor: '#fff'
                        }}
                        placeholder="(555) 123-4567"
                        placeholderTextColor="#999"
                        value={profileData.businessPhone}
                        onChangeText={(text) => setProfileData(prev => ({ ...prev, businessPhone: text }))}
                        keyboardType="phone-pad"
                      />
                    </View>
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity 
              style={{ 
                width: '100%',
                opacity: profileData.accountType ? 1 : 0.6
              }}
              onPress={nextStep}
              disabled={!profileData.accountType}
            >
              <LinearGradient
                colors={['#4CAF50', '#45a049']}
                style={{ paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>
                  Complete Setup
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {profileData.accountType === 'dual' && (
              <View style={{ marginTop: 20, padding: 16, backgroundColor: '#e8f5e8', borderRadius: 8 }}>
                <Text style={{ fontSize: 14, color: '#2e7d32', textAlign: 'center', fontWeight: '600', marginBottom: 4 }}>
                  🎁 Business Account Benefits
                </Text>
                <Text style={{ fontSize: 12, color: '#2e7d32', textAlign: 'center', lineHeight: 18 }}>
                  • Website integration • Custom profile design • Advanced analytics • Livestreaming capabilities • Event management tools
                </Text>
              </View>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{ paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, alignItems: 'center' }}
      >
        <View style={{ 
          width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255, 255, 255, 0.2)',
          justifyContent: 'center', alignItems: 'center', marginBottom: 12
        }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>MP</Text>
        </View>
        
        {/* Progress Indicator */}
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          {[1, 2, 3].map((step) => (
            <View
              key={step}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: step <= currentStep ? '#fff' : 'rgba(255, 255, 255, 0.3)',
                marginHorizontal: 4
              }}
            />
          ))}
        </View>
        
        <Text style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center' }}>
          Step {currentStep} of 3
        </Text>
      </LinearGradient>

      {/* Content */}
      <View style={{ padding: 24 }}>
        {renderStep()}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

// Driver Job Description Screen
const DriverJobDescriptionScreen = ({ navigation }: any) => {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0f0f23' }}>
      {/* Header */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={{ paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20 }}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{ marginBottom: 20 }}
        >
          <Text style={{ fontSize: 16, color: '#9c27b0' }}>← Back</Text>
        </TouchableOpacity>
        
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 }}>
          Drive for MarketPlace
        </Text>
        <Text style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.9)' }}>
          Independent Contractor Opportunity
        </Text>
      </LinearGradient>

      {/* Job Details */}
      <View style={{ padding: 24 }}>
        {/* Position Type */}
        <LinearGradient
          colors={['#6a1b9a', '#8e24aa']}
          style={{ borderRadius: 12, padding: 20, marginBottom: 20 }}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 8 }}>
            🚗 Independent Contractor Position
          </Text>
          <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.9)', lineHeight: 20 }}>
            You will be hired as an independent contractor, not an employee. You control your schedule, work when you want, and are responsible for your own taxes and expenses.
          </Text>
        </LinearGradient>

        {/* Earnings */}
        <View style={{ backgroundColor: '#1a1a2e', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#9c27b0', marginBottom: 12 }}>
            💰 Earnings Breakdown
          </Text>
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 16, color: '#fff', fontWeight: '600' }}>$4 per pickup</Text>
            <Text style={{ fontSize: 14, color: '#ccc' }}>Collect items from sellers</Text>
          </View>
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 16, color: '#fff', fontWeight: '600' }}>$2 per dropoff</Text>
            <Text style={{ fontSize: 14, color: '#ccc' }}>Deliver items to buyers</Text>
          </View>
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 16, color: '#fff', fontWeight: '600' }}>$0.50 per mile</Text>
            <Text style={{ fontSize: 14, color: '#ccc' }}>Mileage compensation</Text>
          </View>
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 16, color: '#fff', fontWeight: '600' }}>100% of tips</Text>
            <Text style={{ fontSize: 14, color: '#ccc' }}>Keep all customer tips</Text>
          </View>
        </View>

        {/* Schedule */}
        <View style={{ backgroundColor: '#1a1a2e', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#9c27b0', marginBottom: 12 }}>
            ⏰ Flexible Schedule
          </Text>
          <Text style={{ fontSize: 14, color: '#ccc', marginBottom: 8 }}>Choose your time blocks:</Text>
          <Text style={{ fontSize: 14, color: '#fff' }}>• 9am - 12pm</Text>
          <Text style={{ fontSize: 14, color: '#fff' }}>• 12pm - 3pm</Text>
          <Text style={{ fontSize: 14, color: '#fff' }}>• 3pm - 6pm</Text>
          <Text style={{ fontSize: 14, color: '#fff' }}>• 6pm - 9pm</Text>
          <Text style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
            Maximum 2 routes per time block, 6 deliveries per route
          </Text>
        </View>

        {/* Requirements */}
        <View style={{ backgroundColor: '#1a1a2e', borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#9c27b0', marginBottom: 12 }}>
            📋 Requirements
          </Text>
          <Text style={{ fontSize: 14, color: '#fff', marginBottom: 4 }}>✓ Valid driver's license</Text>
          <Text style={{ fontSize: 14, color: '#fff', marginBottom: 4 }}>✓ Current auto insurance</Text>
          <Text style={{ fontSize: 14, color: '#fff', marginBottom: 4 }}>✓ Clean background check</Text>
          <Text style={{ fontSize: 14, color: '#fff', marginBottom: 4 }}>✓ Reliable vehicle</Text>
          <Text style={{ fontSize: 14, color: '#fff', marginBottom: 4 }}>✓ Smartphone for app</Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={{ width: '100%', marginBottom: 20 }}
          onPress={() => navigation.navigate('DriverApplication')}
        >
          <LinearGradient
            colors={['#3f51b5', '#2196f3', '#00bcd4']}
            style={{ paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>
              Start Application
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Driver Application Screen
const DriverApplicationScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    licenseNumber: '',
    vehicleYear: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleColor: '',
    licensePlate: '',
    driversLicense: null,
    insurance: null,
    backgroundCheck: null
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate processing
    setTimeout(() => {
      setIsSubmitting(false);
      navigation.navigate('ApplicationSuccess');
    }, 3000);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 20 }}>
              Personal Information
            </Text>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, color: '#ccc', marginBottom: 8 }}>First Name *</Text>
              <TextInput
                style={{ backgroundColor: '#1a1a2e', borderRadius: 8, padding: 12, color: '#fff', fontSize: 16 }}
                value={formData.firstName}
                onChangeText={(text) => setFormData({...formData, firstName: text})}
                placeholder="Enter first name"
                placeholderTextColor="#666"
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, color: '#ccc', marginBottom: 8 }}>Last Name *</Text>
              <TextInput
                style={{ backgroundColor: '#1a1a2e', borderRadius: 8, padding: 12, color: '#fff', fontSize: 16 }}
                value={formData.lastName}
                onChangeText={(text) => setFormData({...formData, lastName: text})}
                placeholder="Enter last name"
                placeholderTextColor="#666"
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, color: '#ccc', marginBottom: 8 }}>Email *</Text>
              <TextInput
                style={{ backgroundColor: '#1a1a2e', borderRadius: 8, padding: 12, color: '#fff', fontSize: 16 }}
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
                placeholder="Enter email address"
                placeholderTextColor="#666"
                keyboardType="email-address"
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, color: '#ccc', marginBottom: 8 }}>Phone Number *</Text>
              <TextInput
                style={{ backgroundColor: '#1a1a2e', borderRadius: 8, padding: 12, color: '#fff', fontSize: 16 }}
                value={formData.phone}
                onChangeText={(text) => setFormData({...formData, phone: text})}
                placeholder="(555) 123-4567"
                placeholderTextColor="#666"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 20 }}>
              Vehicle Information
            </Text>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, color: '#ccc', marginBottom: 8 }}>Driver's License Number *</Text>
              <TextInput
                style={{ backgroundColor: '#1a1a2e', borderRadius: 8, padding: 12, color: '#fff', fontSize: 16 }}
                value={formData.licenseNumber}
                onChangeText={(text) => setFormData({...formData, licenseNumber: text})}
                placeholder="Enter license number"
                placeholderTextColor="#666"
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: '#ccc', marginBottom: 8 }}>Year *</Text>
                <TextInput
                  style={{ backgroundColor: '#1a1a2e', borderRadius: 8, padding: 12, color: '#fff', fontSize: 16 }}
                  value={formData.vehicleYear}
                  onChangeText={(text) => setFormData({...formData, vehicleYear: text})}
                  placeholder="2020"
                  placeholderTextColor="#666"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: '#ccc', marginBottom: 8 }}>Make *</Text>
                <TextInput
                  style={{ backgroundColor: '#1a1a2e', borderRadius: 8, padding: 12, color: '#fff', fontSize: 16 }}
                  value={formData.vehicleMake}
                  onChangeText={(text) => setFormData({...formData, vehicleMake: text})}
                  placeholder="Toyota"
                  placeholderTextColor="#666"
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: '#ccc', marginBottom: 8 }}>Model *</Text>
                <TextInput
                  style={{ backgroundColor: '#1a1a2e', borderRadius: 8, padding: 12, color: '#fff', fontSize: 16 }}
                  value={formData.vehicleModel}
                  onChangeText={(text) => setFormData({...formData, vehicleModel: text})}
                  placeholder="Camry"
                  placeholderTextColor="#666"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: '#ccc', marginBottom: 8 }}>Color *</Text>
                <TextInput
                  style={{ backgroundColor: '#1a1a2e', borderRadius: 8, padding: 12, color: '#fff', fontSize: 16 }}
                  value={formData.vehicleColor}
                  onChangeText={(text) => setFormData({...formData, vehicleColor: text})}
                  placeholder="Blue"
                  placeholderTextColor="#666"
                />
              </View>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, color: '#ccc', marginBottom: 8 }}>License Plate *</Text>
              <TextInput
                style={{ backgroundColor: '#1a1a2e', borderRadius: 8, padding: 12, color: '#fff', fontSize: 16 }}
                value={formData.licensePlate}
                onChangeText={(text) => setFormData({...formData, licensePlate: text})}
                placeholder="ABC-1234"
                placeholderTextColor="#666"
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 20 }}>
              Required Documents
            </Text>

            {/* Driver's License Upload */}
            <View style={{ backgroundColor: '#1a1a2e', borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <Text style={{ fontSize: 16, color: '#9c27b0', fontWeight: '600', marginBottom: 8 }}>
                📄 Driver's License
              </Text>
              <Text style={{ fontSize: 14, color: '#ccc', marginBottom: 12 }}>
                Upload a clear photo of your valid driver's license
              </Text>
              <TouchableOpacity style={{ backgroundColor: '#3f51b5', padding: 12, borderRadius: 8, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>
                  {formData.driversLicense ? 'License Uploaded ✓' : 'Upload License'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Insurance Upload */}
            <View style={{ backgroundColor: '#1a1a2e', borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <Text style={{ fontSize: 16, color: '#9c27b0', fontWeight: '600', marginBottom: 8 }}>
                🛡️ Auto Insurance
              </Text>
              <Text style={{ fontSize: 14, color: '#ccc', marginBottom: 12 }}>
                Upload current auto insurance proof (declaration page)
              </Text>
              <TouchableOpacity style={{ backgroundColor: '#3f51b5', padding: 12, borderRadius: 8, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>
                  {formData.insurance ? 'Insurance Uploaded ✓' : 'Upload Insurance'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Background Check */}
            <View style={{ backgroundColor: '#1a1a2e', borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <Text style={{ fontSize: 16, color: '#9c27b0', fontWeight: '600', marginBottom: 8 }}>
                🔍 Background Check
              </Text>
              <Text style={{ fontSize: 14, color: '#ccc', marginBottom: 12 }}>
                Upload recent background check (applicant responsibility - $29.99)
              </Text>
              <TouchableOpacity style={{ backgroundColor: '#3f51b5', padding: 12, borderRadius: 8, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>
                  {formData.backgroundCheck ? 'Background Check Uploaded ✓' : 'Upload Background Check'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ backgroundColor: '#2d1b69', borderRadius: 8, padding: 16, marginBottom: 20 }}>
              <Text style={{ fontSize: 14, color: '#fff', textAlign: 'center', lineHeight: 20 }}>
                ⚡ Once all documents are verified, you'll receive driver dashboard credentials via email within 24 hours.
              </Text>
            </View>
          </View>
        );
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0f0f23' }}>
      {/* Header */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={{ paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20 }}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{ marginBottom: 20 }}
        >
          <Text style={{ fontSize: 16, color: '#9c27b0' }}>← Back</Text>
        </TouchableOpacity>
        
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 }}>
          Driver Application
        </Text>
        
        {/* Progress Indicator */}
        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          {[1, 2, 3].map((step) => (
            <View
              key={step}
              style={{
                flex: 1,
                height: 4,
                backgroundColor: step <= currentStep ? '#9c27b0' : 'rgba(255, 255, 255, 0.3)',
                marginHorizontal: 2,
                borderRadius: 2
              }}
            />
          ))}
        </View>
        <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.9)', marginTop: 8 }}>
          Step {currentStep} of 3
        </Text>
      </LinearGradient>

      {/* Content */}
      <View style={{ padding: 24 }}>
        {renderStep()}

        {/* Navigation Buttons */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
          {currentStep > 1 && (
            <TouchableOpacity 
              style={{ flex: 1, backgroundColor: '#1a1a2e', padding: 16, borderRadius: 8, alignItems: 'center' }}
              onPress={prevStep}
            >
              <Text style={{ color: '#9c27b0', fontWeight: '600' }}>Previous</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={{ 
              flex: 1, 
              opacity: isSubmitting ? 0.6 : 1
            }}
            onPress={currentStep === 3 ? handleSubmit : nextStep}
            disabled={isSubmitting}
          >
            <LinearGradient
              colors={['#3f51b5', '#2196f3', '#00bcd4']}
              style={{ padding: 16, borderRadius: 8, alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>
                {isSubmitting ? 'Submitting...' : currentStep === 3 ? 'Submit Application' : 'Next'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

// Application Success Screen
const ApplicationSuccessScreen = ({ navigation }: any) => (
  <ScrollView style={{ flex: 1, backgroundColor: '#0f0f23' }}>
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={{ paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20, alignItems: 'center', minHeight: 400 }}
    >
      <View style={{ 
        width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(156, 39, 176, 0.2)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 24, marginTop: 60
      }}>
        <Text style={{ fontSize: 48, color: '#9c27b0' }}>✓</Text>
      </View>
      
      <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 12, textAlign: 'center' }}>
        Application Submitted!
      </Text>
      
      <Text style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center', lineHeight: 24, marginBottom: 32 }}>
        We're reviewing your application and documents. If approved, you'll receive your driver dashboard login credentials via email within 24 hours.
      </Text>

      <TouchableOpacity 
        style={{ width: '100%', marginBottom: 16 }}
        onPress={() => navigation.navigate('CampaignLanding')}
      >
        <LinearGradient
          colors={['#673ab7', '#9c27b0', '#e91e63']}
          style={{ paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, alignItems: 'center' }}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>
            Return to Home
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  </ScrollView>
);

const CampaignLandingScreen = ({ navigation }: any) => (
  <ScrollView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
    {/* Hero Section */}
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={{ paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20, alignItems: 'center' }}
    >
      <View style={{ 
        width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 16
      }}>
        <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#fff' }}>MP</Text>
      </View>
      <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 8 }}>MarketPlace</Text>
      <Text style={{ fontSize: 18, fontWeight: '600', color: 'rgba(255, 255, 255, 0.95)', marginBottom: 8, textAlign: 'center' }}>
        Pick Up the Pace in Your Community
      </Text>
      <Text style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center' }}>
        Delivering Opportunities — Not Just Packages
      </Text>
    </LinearGradient>

    {/* Mission */}
    <View style={{ padding: 24, backgroundColor: '#fff', marginVertical: 8 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 16, textAlign: 'center' }}>
        Our Mission
      </Text>
      <Text style={{ fontSize: 16, color: '#555', fontStyle: 'italic', textAlign: 'center', lineHeight: 24 }}>
        "Big tech platforms have taught us to rely on strangers and algorithms. MarketPlace reminds us what happens when we invest in each other."
      </Text>
    </View>

    {/* Campaign Tracker */}
    <View style={{ padding: 24, backgroundColor: '#fff', marginVertical: 8 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 16, textAlign: 'center' }}>
        🚀 Campaign Progress
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' }}>
        <View style={{ alignItems: 'center', marginBottom: 16, minWidth: '18%' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#667eea', marginBottom: 4 }}>12</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>Towns</Text>
        </View>
        <View style={{ alignItems: 'center', marginBottom: 16, minWidth: '18%' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#667eea', marginBottom: 4 }}>247</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>Shops</Text>
        </View>
        <View style={{ alignItems: 'center', marginBottom: 16, minWidth: '18%' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#667eea', marginBottom: 4 }}>89</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>Entertainers</Text>
        </View>
        <View style={{ alignItems: 'center', marginBottom: 16, minWidth: '18%' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#667eea', marginBottom: 4 }}>156</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>Services</Text>
        </View>
        <View style={{ alignItems: 'center', marginBottom: 16, minWidth: '18%' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#667eea', marginBottom: 4 }}>1,834</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>Members</Text>
        </View>
      </View>
    </View>

    {/* Early Member Benefits */}
    <LinearGradient
      colors={['#6a1b9a', '#8e24aa', '#ab47bc']}
      style={{ margin: 20, borderRadius: 16, padding: 24 }}
    >
      <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 }}>
        🎁 Early Member Exclusive
      </Text>
      <Text style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center', marginBottom: 16 }}>
        Join the Campaign, Get Lifetime Benefits
      </Text>
      <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center', lineHeight: 20 }}>
        Campaign members who join during our city-by-city rollout will never pay the $3.99/month Pro subscription fee. Lock in your lifetime access now!
      </Text>
    </LinearGradient>

    {/* Call to Action */}
    <View style={{ padding: 24, alignItems: 'center' }}>
      <TouchableOpacity 
        style={{ width: '100%', marginBottom: 16 }}
        onPress={() => navigation.navigate('SignUpLogin', { mode: 'signup' })}
      >
        <LinearGradient
          colors={['#673ab7', '#9c27b0', '#e91e63']}
          style={{ paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, alignItems: 'center' }}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 }}>
            Join the Campaign
          </Text>
          <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.9)' }}>
            Get Lifetime Pro Access
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity 
        style={{ width: '100%', marginBottom: 16 }}
        onPress={() => navigation.navigate('DriverJobDescription')}
      >
        <LinearGradient
          colors={['#3f51b5', '#2196f3', '#00bcd4']}
          style={{ paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, alignItems: 'center' }}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 }}>
            Apply to Drive
          </Text>
          <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.9)' }}>
            Earn $4 pickup + $2 dropoff + $0.50/mile + 100% tips
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity 
        style={{ paddingVertical: 12, paddingHorizontal: 24 }}
        onPress={() => navigation.navigate('SignUpLogin', { mode: 'login' })}
      >
        <Text style={{ fontSize: 16, color: '#9c27b0', textAlign: 'center' }}>
          Already a Member? Log In
        </Text>
      </TouchableOpacity>
    </View>

    {/* Core Reasons */}
    <View style={{ padding: 24, backgroundColor: '#fff', marginVertical: 8 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 16, textAlign: 'center' }}>
        Why Join MarketPlace?
      </Text>
      
      <View style={{ flexDirection: 'row', backgroundColor: '#f8f9fa', borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#667eea' }}>
        <Text style={{ fontSize: 20, marginRight: 12, marginTop: 2 }}>🏘️</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 }}>Community First</Text>
          <Text style={{ fontSize: 14, color: '#666', lineHeight: 20 }}>Keep money circulating in your neighborhood instead of flowing to distant corporations</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', backgroundColor: '#f8f9fa', borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#667eea' }}>
        <Text style={{ fontSize: 20, marginRight: 12, marginTop: 2 }}>💰</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 }}>Fair Economics</Text>
          <Text style={{ fontSize: 14, color: '#666', lineHeight: 20 }}>Transparent 5% fees, no hidden charges, 100% of tips go directly to drivers</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', backgroundColor: '#f8f9fa', borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#667eea' }}>
        <Text style={{ fontSize: 20, marginRight: 12, marginTop: 2 }}>🚚</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 }}>Local Delivery</Text>
          <Text style={{ fontSize: 14, color: '#666', lineHeight: 20 }}>Neighbor-to-neighbor delivery system creating jobs and building connections</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', backgroundColor: '#f8f9fa', borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#667eea' }}>
        <Text style={{ fontSize: 20, marginRight: 12, marginTop: 2 }}>🎯</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 }}>Everything Local</Text>
          <Text style={{ fontSize: 14, color: '#666', lineHeight: 20 }}>Buy, sell, rent, find services, book entertainment - all in one community platform</Text>
        </View>
      </View>
    </View>

    <View style={{ height: 40 }} />
  </ScrollView>
);

// Home Stack with Campaign Landing and Sign Up
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CampaignLanding" component={CampaignLandingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SignUpLogin" component={SignUpLoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MemberQuestionnaire" component={MemberQuestionnaireScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProfessionalProfile" component={ProfessionalProfile} options={{ headerShown: false }} />
      <Stack.Screen name="DriverJobDescription" component={DriverJobDescriptionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DriverApplication" component={DriverApplicationScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ApplicationSuccess" component={ApplicationSuccessScreen} options={{ headerShown: false }} />
      {/* Guest Mode Screens */}
      <Stack.Screen name="GuestLocationSetup" component={GuestLocationSetup} options={{ headerShown: false }} />
      <Stack.Screen name="GuestMarketplace" component={GuestMarketplace} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function MarketplaceStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MarketplaceHome" component={() => <SimpleScreen title="Marketplace" />} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function DeliveryStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="DeliveryHub" component={DeliveryHub} options={{ headerShown: false }} />
      <Stack.Screen name="DeliveryTrackingDemo" component={DeliveryTrackingDemo} options={{ title: 'Route Demo' }} />
      <Stack.Screen name="EnhancedDriverApplication" component={EnhancedDriverApplication} options={{ title: 'Driver Application' }} />
      <Stack.Screen name="UberEatsStyleDashboard" component={UberEatsStyleDashboard} options={{ title: 'Driver Dashboard' }} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProfileHome" component={() => <SimpleScreen title="Profile" />} options={{ headerShown: false }} />
      <Stack.Screen name="RevenueDashboard" component={RevenueDashboard} options={{ title: 'Revenue Center' }} />
      <Stack.Screen name="RevenueDemo" component={RevenueDemo} options={{ title: 'Revenue System Demo' }} />
    </Stack.Navigator>
  );
}

// Create screens for all marketplace categories
const RentScreen = () => <SimpleScreen title="Rent Items" />;
const BuySellScreen = () => <SimpleScreen title="Buy & Sell" />;
const OddJobsScreen = () => <SimpleScreen title="Odd Jobs" />;
const ServicesScreen = () => <SimpleScreen title="Services" />;
const ShopsScreen = () => <SimpleScreen title="Local Shops" />;
const TheHubScreen = () => <SimpleScreen title="The Hub - Entertainment" />;
const CommunityFeedScreen = ({ navigation }: any) => (
  <ScrollView style={{ flex: 1, backgroundColor: '#0F0B1F' }}>
    {/* Header */}
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={{ paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'between' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', marginLeft: 15 }}>
          Community Feed
        </Text>
        <View style={{ flex: 1 }} />
      </View>
    </LinearGradient>

    {/* Create Post Section */}
    <View style={{ padding: 20 }}>
      <View style={{ 
        backgroundColor: 'rgba(139, 92, 246, 0.1)', 
        borderRadius: 12, 
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.3)'
      }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 }}>
          What's happening in your community?
        </Text>
        
        {/* Post Type Buttons */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {[
            { label: 'General Post', icon: 'chatbubble', color: '#8B5CF6' },
            { label: 'Live Stream', icon: 'videocam', color: '#EF4444' },
            { label: 'Poll', icon: 'bar-chart', color: '#10B981' },
            { label: 'Local Event', icon: 'calendar', color: '#F59E0B' }
          ].map((item, index) => (
            <TouchableOpacity 
              key={index}
              style={{
                backgroundColor: `${item.color}20`,
                borderRadius: 8,
                padding: 8,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: `${item.color}50`
              }}
            >
              <Ionicons name={item.icon as any} size={16} color={item.color} style={{ marginRight: 6 }} />
              <Text style={{ color: item.color, fontSize: 12, fontWeight: '600' }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Community Feed Posts */}
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 16 }}>
          Recent Community Posts
        </Text>

        {/* Sample Posts */}
        {[
          {
            user: 'Sarah M.',
            time: '2 hours ago',
            type: 'event',
            content: 'Community BBQ this Saturday at Riverside Park! Bring your family and neighbors. Food trucks and live music starting at 2 PM.',
            icon: 'calendar',
            color: '#F59E0B'
          },
          {
            user: 'Mike D.',
            time: '4 hours ago', 
            type: 'poll',
            content: 'Should we petition the city for a new bike lane on Main Street?',
            icon: 'bar-chart',
            color: '#10B981'
          },
          {
            user: 'Local Coffee Shop',
            time: '6 hours ago',
            type: 'general',
            content: 'New seasonal menu is here! Try our pumpkin spice latte and apple cider donuts. 20% off for MarketPlace members!',
            icon: 'chatbubble',
            color: '#8B5CF6'
          }
        ].map((post, index) => (
          <View 
            key={index}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: `${post.color}30`,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12
              }}>
                <Ionicons name={post.icon as any} size={20} color={post.color} />
              </View>
              <View>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>
                  {post.user}
                </Text>
                <Text style={{ fontSize: 12, color: '#B8B8B8' }}>
                  {post.time}
                </Text>
              </View>
            </View>
            
            <Text style={{ fontSize: 14, color: '#E5E5E5', lineHeight: 20 }}>
              {post.content}
            </Text>

            {/* Interaction Buttons */}
            <View style={{ flexDirection: 'row', marginTop: 12, gap: 16 }}>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="heart-outline" size={18} color="#B8B8B8" />
                <Text style={{ color: '#B8B8B8', marginLeft: 4, fontSize: 12 }}>Like</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="chatbubble-outline" size={18} color="#B8B8B8" />
                <Text style={{ color: '#B8B8B8', marginLeft: 4, fontSize: 12 }}>Comment</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="share-outline" size={18} color="#B8B8B8" />
                <Text style={{ color: '#B8B8B8', marginLeft: 4, fontSize: 12 }}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>

    {/* Bottom padding for floating navigation */}
    <View style={{ height: 100 }} />
  </ScrollView>
);

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Rent') {
            iconName = focused ? 'key' : 'key-outline';
          } else if (route.name === 'BuySell') {
            iconName = focused ? 'storefront' : 'storefront-outline';
          } else if (route.name === 'OddJobs') {
            iconName = focused ? 'hammer' : 'hammer-outline';
          } else if (route.name === 'Services') {
            iconName = focused ? 'construct' : 'construct-outline';
          } else if (route.name === 'Shops') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'TheHub') {
            iconName = focused ? 'musical-notes' : 'musical-notes-outline';
          } else if (route.name === 'Menu') {
            iconName = focused ? 'menu' : 'menu-outline';
          } else {
            iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#8B5CF6', // Purple theme
        tabBarInactiveTintColor: '#6B7280', // Gray
        tabBarStyle: {
          backgroundColor: '#1F2937', // Dark background
          borderTopColor: 'rgba(139, 92, 246, 0.3)',
          borderTopWidth: 1,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -5 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          paddingBottom: 10,
          paddingTop: 8,
          height: 85,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginBottom: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Rent" 
        component={RentScreen}
        options={{ tabBarLabel: 'Rent' }}
      />
      <Tab.Screen 
        name="BuySell" 
        component={BuySellScreen}
        options={{ tabBarLabel: 'Buy/Sell' }}
      />
      <Tab.Screen 
        name="OddJobs" 
        component={OddJobsScreen}
        options={{ tabBarLabel: 'Odd Jobs' }}
      />
      <Tab.Screen 
        name="Services" 
        component={ServicesScreen}
        options={{ tabBarLabel: 'Services' }}
      />
      <Tab.Screen 
        name="Shops" 
        component={ShopsScreen}
        options={{ tabBarLabel: 'Shops' }}
      />
      <Tab.Screen 
        name="TheHub" 
        component={TheHubScreen}
        options={{ tabBarLabel: 'The Hub' }}
      />
      <Tab.Screen 
        name="Menu" 
        component={MainMenuStack}
        options={{ tabBarLabel: 'Menu' }}
      />
    </Tab.Navigator>
  );
}

// Main Menu Stack with Community Feed and other options
function MainMenuStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MainMenu" 
        component={MainMenuScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="CommunityFeed" 
        component={CommunityFeedScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Profile" 
        component={() => <SimpleScreen title="Profile" />} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Settings" 
        component={() => <SimpleScreen title="Settings" />} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Deliveries" 
        component={() => <SimpleScreen title="Deliveries" />} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
}

// Main Menu Screen - Facebook-style menu
const MainMenuScreen = ({ navigation }: any) => (
  <ScrollView style={{ flex: 1, backgroundColor: '#0F0B1F' }}>
    {/* Header */}
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={{ paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <View style={{ 
          width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255, 255, 255, 0.2)',
          justifyContent: 'center', alignItems: 'center', marginRight: 15
        }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>MP</Text>
        </View>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>MarketPlace Menu</Text>
      </View>
    </LinearGradient>

    {/* Menu Options */}
    <View style={{ padding: 20 }}>
      {/* Community Section */}
      <TouchableOpacity 
        style={{ 
          backgroundColor: 'rgba(139, 92, 246, 0.1)', 
          borderRadius: 12, 
          padding: 16, 
          marginBottom: 16,
          borderWidth: 1,
          borderColor: 'rgba(139, 92, 246, 0.3)'
        }}
        onPress={() => navigation.navigate('CommunityFeed')}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="people" size={24} color="#8B5CF6" style={{ marginRight: 12 }} />
          <View>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 }}>
              Community Feed
            </Text>
            <Text style={{ fontSize: 14, color: '#B8B8B8' }}>
              Local posts, live streams, polls, events
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Quick Access Categories */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 }}>
          Quick Access
        </Text>
        
        {[
          { name: 'Profile', icon: 'person', description: 'Your profile and settings' },
          { name: 'Deliveries', icon: 'car', description: 'Track your deliveries' },
          { name: 'Settings', icon: 'settings', description: 'App preferences' },
        ].map((item, index) => (
          <TouchableOpacity 
            key={index}
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)', 
              borderRadius: 8, 
              padding: 14, 
              marginBottom: 8,
              flexDirection: 'row',
              alignItems: 'center'
            }}
            onPress={() => navigation.navigate(item.name)}
          >
            <Ionicons name={item.icon as any} size={20} color="#8B5CF6" style={{ marginRight: 12 }} />
            <View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
                {item.name}
              </Text>
              <Text style={{ fontSize: 12, color: '#B8B8B8' }}>
                {item.description}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  </ScrollView>
);

// Create the onboarding stack
function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileSetup" component={SimpleProfileSetupScreen} />
      <Stack.Screen name="AccountTypeSelection" component={AccountTypeSelectionScreen} />
      <Stack.Screen name="BusinessSetup" component={BusinessSetupScreen} />
      <Stack.Screen name="OnboardingComplete" component={OnboardingCompleteScreen} />
    </Stack.Navigator>
  );
}

function AppContent() {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // If user is authenticated but hasn't completed onboarding, show onboarding
  if (isAuthenticated && user && !user.onboardingCompleted) {
    return (
      <NavigationContainer>
        <OnboardingStack />
      </NavigationContainer>
    );
  }

  // If user is authenticated and has completed onboarding, show main app
  if (isAuthenticated && user && user.onboardingCompleted) {
    return (
      <NavigationContainer>
        <MainTabs />
      </NavigationContainer>
    );
  }

  // Show main app directly for demo
  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <StatusBar style="light" backgroundColor={colors.background} />
            <AppContent />
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
