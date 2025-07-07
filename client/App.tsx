import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Animated, Dimensions } from 'react-native';
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
import { Linking } from 'react-native';
import Community from './src/screens/Community.js';

// Facebook Share Component
const FacebookShareButton = () => {
  const shareToFacebook = () => {
    const shareUrl = encodeURIComponent('https://MarketPace.shop');
    const shareText = encodeURIComponent('Join the community-first marketplace revolution! MarketPace is building stronger neighborhoods through local commerce. #MarketPace #CommunityFirst #LocalCommerce');
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`;
    
    Linking.openURL(facebookUrl);
  };

  return (
    <TouchableOpacity 
      style={styles.facebookShare} 
      onPress={shareToFacebook}
      accessibilityLabel="Share MarketPace to Facebook"
    >
      <Text style={styles.facebookShareText}>📘 Share to Facebook</Text>
    </TouchableOpacity>
  );
};

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

// Dark Purple Futuristic Theme Colors
const colors = {
  background: '#0d0221',
  backgroundSecondary: '#1a0633', 
  backgroundTertiary: '#2d1b4e',
  primary: '#00FFFF',
  secondary: '#8A2BE2',
  accent: '#00BFFF',
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.8)',
  card: 'rgba(255, 255, 255, 0.04)',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
};

// Floating Particles Component
const FloatingParticles = () => {
  const { width, height } = Dimensions.get('window');
  const [particles] = useState(() => 
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      animValue: new Animated.Value(0),
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.6 + 0.2,
    }))
  );

  useEffect(() => {
    particles.forEach((particle, index) => {
      const animate = () => {
        Animated.loop(
          Animated.timing(particle.animValue, {
            toValue: 1,
            duration: 8000 + (index * 200),
            useNativeDriver: true,
          })
        ).start();
      };
      setTimeout(animate, index * 100);
    });
  }, [particles]);

  return (
    <View style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      pointerEvents: 'none',
      zIndex: 1
    }}>
      {particles.map((particle) => (
        <Animated.View
          key={particle.id}
          style={{
            position: 'absolute',
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: Math.random() > 0.5 ? colors.primary : colors.secondary,
            borderRadius: particle.size / 2,
            opacity: particle.opacity,
            transform: [{
              translateY: particle.animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -height - 100],
              }),
            }],
          }}
        />
      ))}
    </View>
  );
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
  <ScrollView 
    style={{ flex: 1, backgroundColor: '#f8f9fa' }}
    contentContainerStyle={{ flexGrow: 1 }}
    showsVerticalScrollIndicator={false}
  >
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

    {/* Bottom padding for floating navigation */}
    <View style={{ height: 100 }} />
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
// Unified Marketplace Screen with Category Navigation
const MarketplaceMainScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('rent');

  const categories = [
    { id: 'rent', name: 'Rent', icon: 'key', color: '#8B5CF6' },
    { id: 'buysell', name: 'Buy/Sell', icon: 'storefront', color: '#3B82F6' },
    { id: 'oddjobs', name: 'Odd Jobs', icon: 'hammer', color: '#10B981' },
    { id: 'services', name: 'Services', icon: 'construct', color: '#F59E0B' },
    { id: 'shops', name: 'Shops', icon: 'business', color: '#EF4444' },
    { id: 'hub', name: 'The Hub', icon: 'musical-notes', color: '#8B5CF6' },
  ];

  const renderCategoryContent = () => {
    switch (selectedCategory) {
      case 'rent':
        return (
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 16 }}>
              Rent Anything
            </Text>
            <Text style={{ fontSize: 16, color: '#9CA3AF', marginBottom: 20 }}>
              From tools to baby gear, rent what you need from neighbors
            </Text>
            {/* Demo listings */}
            {[
              { name: 'Power Drill Set', price: '$15/day', owner: 'Mike S.', distance: '0.3 mi' },
              { name: 'Baby Stroller', price: '$8/day', owner: 'Sarah L.', distance: '0.5 mi' },
              { name: 'Camping Tent', price: '$25/day', owner: 'David R.', distance: '0.8 mi' },
            ].map((item, index) => (
              <View key={index} style={{
                backgroundColor: '#1F2937',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>{item.name}</Text>
                  <Text style={{ fontSize: 14, color: '#9CA3AF' }}>{item.owner} • {item.distance}</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#8B5CF6' }}>{item.price}</Text>
              </View>
            ))}
          </View>
        );
      case 'buysell':
        return (
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 16 }}>
              Buy & Sell
            </Text>
            <Text style={{ fontSize: 16, color: '#9CA3AF', marginBottom: 20 }}>
              Local marketplace for buying and selling items
            </Text>
            {/* Demo listings */}
            {[
              { name: 'Vintage Guitar', price: '$450', owner: "Mike's Music", distance: '0.2 mi' },
              { name: 'Coffee Table', price: '$75', owner: 'Jennifer K.', distance: '0.4 mi' },
              { name: 'Exercise Bike', price: '$200', owner: 'Tom B.', distance: '0.7 mi' },
            ].map((item, index) => (
              <View key={index} style={{
                backgroundColor: '#1F2937',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>{item.name}</Text>
                  <Text style={{ fontSize: 14, color: '#9CA3AF' }}>{item.owner} • {item.distance}</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#3B82F6' }}>{item.price}</Text>
              </View>
            ))}
          </View>
        );
      case 'oddjobs':
        return (
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 16 }}>
              Odd Jobs
            </Text>
            <Text style={{ fontSize: 16, color: '#9CA3AF', marginBottom: 20 }}>
              Quick tasks and gig opportunities from neighbors
            </Text>
            {/* Demo listings */}
            {[
              { name: 'Dog Walking', price: '$20/walk', owner: 'Lisa M.', distance: '0.2 mi', timeframe: 'Weekdays 7-9am' },
              { name: 'Furniture Assembly', price: '$35/hr', owner: 'Carlos R.', distance: '0.4 mi', timeframe: 'Weekends' },
              { name: 'Garden Cleanup', price: '$60', owner: 'Bob K.', distance: '0.6 mi', timeframe: 'This weekend' },
            ].map((item, index) => (
              <View key={index} style={{
                backgroundColor: '#1F2937',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>{item.name}</Text>
                  <Text style={{ fontSize: 14, color: '#9CA3AF' }}>{item.owner} • {item.distance}</Text>
                  <Text style={{ fontSize: 12, color: '#10B981' }}>{item.timeframe}</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#10B981' }}>{item.price}</Text>
              </View>
            ))}
          </View>
        );
      case 'services':
        return (
          <ServiceBookingScreen />
        );
      case 'shops':
        return (
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 16 }}>
              Local Shops
            </Text>
            <Text style={{ fontSize: 16, color: '#9CA3AF', marginBottom: 20 }}>
              Support local businesses in your community
            </Text>
            {/* Demo listings */}
            {[
              { name: "Mike's Music Shop", category: 'Instruments & Repair', owner: 'Mike Stevens', distance: '0.2 mi', rating: '4.9★' },
              { name: 'Corner Bakery', category: 'Fresh Bread & Pastries', owner: 'Maria Santos', distance: '0.3 mi', rating: '4.8★' },
              { name: 'Tech Repair Hub', category: 'Electronics Repair', owner: 'David Kim', distance: '0.5 mi', rating: '4.7★' },
            ].map((item, index) => (
              <View key={index} style={{
                backgroundColor: '#1F2937',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>{item.name}</Text>
                  <Text style={{ fontSize: 14, color: '#9CA3AF' }}>{item.category}</Text>
                  <Text style={{ fontSize: 12, color: '#9CA3AF' }}>{item.owner} • {item.distance}</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#EF4444' }}>{item.rating}</Text>
              </View>
            ))}
          </View>
        );
      case 'hub':
        return (
          <EntertainmentBookingScreen />
        );
      default:
        return (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 16 }}>
              {categories.find(c => c.id === selectedCategory)?.name}
            </Text>
            <Text style={{ fontSize: 16, color: '#9CA3AF', textAlign: 'center' }}>
              This section is coming soon. Join the campaign to be notified when it launches!
            </Text>
          </View>
        );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0F0B1F' }}>
      {/* Header */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={{ paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 }}
      >
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 }}>
          MarketPlace
        </Text>
        <Text style={{ fontSize: 16, color: '#B0B0B0' }}>
          Your local community marketplace
        </Text>
      </LinearGradient>

      {/* Category Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={{ backgroundColor: '#1F2937', paddingVertical: 16 }}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={{
              alignItems: 'center',
              marginRight: 20,
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 20,
              backgroundColor: selectedCategory === category.id ? category.color : 'transparent',
              minWidth: 80
            }}
          >
            <Ionicons 
              name={category.icon as any} 
              size={24} 
              color={selectedCategory === category.id ? '#fff' : '#9CA3AF'} 
            />
            <Text style={{ 
              fontSize: 12, 
              fontWeight: '600',
              color: selectedCategory === category.id ? '#fff' : '#9CA3AF',
              marginTop: 4,
              textAlign: 'center'
            }}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView style={{ flex: 1 }}>
        {renderCategoryContent()}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

// Community Feed Screen  
const CommunityFeedScreen = ({ navigation }: any) => (
  <View style={{ flex: 1, backgroundColor: colors.background }}>
    <FloatingParticles />
    <ScrollView style={{ flex: 1, zIndex: 2 }}>
    {/* Header */}
    <LinearGradient
      colors={[colors.backgroundSecondary, colors.backgroundTertiary, colors.background]}
      style={{ paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Marketplace') {
            iconName = focused ? 'storefront' : 'storefront-outline';
          } else if (route.name === 'Community') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Deliveries') {
            iconName = focused ? 'car' : 'car-outline';
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
        name="Home" 
        component={HomeStack}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Marketplace" 
        component={MarketplaceMainScreen}
        options={{ tabBarLabel: 'Marketplace' }}
      />
      <Tab.Screen 
        name="Community" 
        component={Community}
        options={{ tabBarLabel: 'Community' }}
      />
      <Tab.Screen 
        name="Deliveries" 
        component={DeliveryTrackingScreen}
        options={{ tabBarLabel: 'Deliveries' }}
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
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Subscription" 
        component={SubscriptionScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="SecurityPolicies" 
        component={SecurityPoliciesScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="DeliveryTracking" 
        component={DeliveryTrackingScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="DeliveryDemo" 
        component={DeliveryDemoScreen} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
}

// Service Booking Screen with Calendar
const ServiceBookingScreen = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const services = [
    { 
      id: 1, 
      name: 'House Cleaning', 
      provider: 'Maria Santos', 
      price: '$80/3hrs', 
      rating: '4.9★', 
      distance: '0.3 mi',
      availableDates: ['2025-01-08', '2025-01-09', '2025-01-10', '2025-01-15', '2025-01-16']
    },
    { 
      id: 2, 
      name: 'Plumbing Repair', 
      provider: 'Carlos Rodriguez', 
      price: '$65/hr', 
      rating: '4.8★', 
      distance: '0.5 mi',
      availableDates: ['2025-01-07', '2025-01-08', '2025-01-14', '2025-01-15']
    },
    { 
      id: 3, 
      name: 'Lawn Care & Maintenance', 
      provider: 'Green Thumb Services', 
      price: '$45/visit', 
      rating: '4.7★', 
      distance: '0.2 mi',
      availableDates: ['2025-01-07', '2025-01-09', '2025-01-11', '2025-01-13', '2025-01-16']
    }
  ];

  const handleBookService = (service: any) => {
    setSelectedService(service);
    setShowCalendar(true);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    // Here would be the actual booking logic
    alert(`Booking ${selectedService?.name} with ${selectedService?.provider} on ${date}`);
    setShowCalendar(false);
    setSelectedService(null);
  };

  if (showCalendar && selectedService) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F0B1F', padding: 20 }}>
        <TouchableOpacity 
          onPress={() => setShowCalendar(false)}
          style={{ marginBottom: 20, flexDirection: 'row', alignItems: 'center' }}
        >
          <Ionicons name="arrow-back" size={24} color="#8B5CF6" />
          <Text style={{ color: '#8B5CF6', marginLeft: 8, fontSize: 16 }}>Back to Services</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 }}>
          Book {selectedService.name}
        </Text>
        <Text style={{ fontSize: 16, color: '#9CA3AF', marginBottom: 20 }}>
          with {selectedService.provider} • {selectedService.price}
        </Text>

        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 16 }}>
          Available Dates
        </Text>

        {selectedService.availableDates.map((date: string) => (
          <TouchableOpacity
            key={date}
            onPress={() => handleDateSelect(date)}
            style={{
              backgroundColor: '#1F2937',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <View>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>
                {new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
              <Text style={{ fontSize: 14, color: '#10B981' }}>Available all day</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8B5CF6" />
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 16 }}>
        Professional Services
      </Text>
      <Text style={{ fontSize: 16, color: '#9CA3AF', marginBottom: 20 }}>
        Book trusted local service providers
      </Text>

      {services.map((service) => (
        <View key={service.id} style={{
          backgroundColor: '#1F2937',
          borderRadius: 12,
          padding: 16,
          marginBottom: 12
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>{service.name}</Text>
              <Text style={{ fontSize: 14, color: '#9CA3AF' }}>{service.provider} • {service.distance}</Text>
              <Text style={{ fontSize: 14, color: '#F59E0B', marginTop: 4 }}>{service.rating}</Text>
            </View>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#F59E0B' }}>{service.price}</Text>
          </View>
          
          <TouchableOpacity
            onPress={() => handleBookService(service)}
            style={{
              backgroundColor: '#F59E0B',
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 8,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>
              Book Service
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

// Entertainment Booking Screen with Calendar
const EntertainmentBookingScreen = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const entertainers = [
    { 
      id: 1, 
      name: 'Jazz Night with Marcus Blues', 
      type: 'Live Music', 
      provider: 'Marcus Johnson', 
      price: '$150/event', 
      rating: '4.9★', 
      distance: '0.4 mi',
      availableDates: ['2025-01-10', '2025-01-11', '2025-01-17', '2025-01-18', '2025-01-24']
    },
    { 
      id: 2, 
      name: 'Comedy Night Special', 
      type: 'Stand-up Comedy', 
      provider: 'Sarah Laughs', 
      price: '$120/show', 
      rating: '4.8★', 
      distance: '0.6 mi',
      availableDates: ['2025-01-08', '2025-01-09', '2025-01-15', '2025-01-16', '2025-01-22']
    },
    { 
      id: 3, 
      name: 'DJ Mix & Party Vibes', 
      type: 'DJ Services', 
      provider: 'DJ Spin Master', 
      price: '$200/4hrs', 
      rating: '4.7★', 
      distance: '0.3 mi',
      availableDates: ['2025-01-11', '2025-01-12', '2025-01-18', '2025-01-19', '2025-01-25']
    }
  ];

  const handleBookEvent = (event: any) => {
    setSelectedEvent(event);
    setShowCalendar(true);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    // Here would be the actual booking logic
    alert(`Booking ${selectedEvent?.name} with ${selectedEvent?.provider} on ${date}`);
    setShowCalendar(false);
    setSelectedEvent(null);
  };

  if (showCalendar && selectedEvent) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F0B1F', padding: 20 }}>
        <TouchableOpacity 
          onPress={() => setShowCalendar(false)}
          style={{ marginBottom: 20, flexDirection: 'row', alignItems: 'center' }}
        >
          <Ionicons name="arrow-back" size={24} color="#8B5CF6" />
          <Text style={{ color: '#8B5CF6', marginLeft: 8, fontSize: 16 }}>Back to Entertainment</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 }}>
          Book {selectedEvent.name}
        </Text>
        <Text style={{ fontSize: 16, color: '#9CA3AF', marginBottom: 20 }}>
          with {selectedEvent.provider} • {selectedEvent.price}
        </Text>

        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 16 }}>
          Available Dates
        </Text>

        {selectedEvent.availableDates.map((date: string) => (
          <TouchableOpacity
            key={date}
            onPress={() => handleDateSelect(date)}
            style={{
              backgroundColor: '#1F2937',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <View>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>
                {new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
              <Text style={{ fontSize: 14, color: '#8B5CF6' }}>Available for events</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8B5CF6" />
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 16 }}>
        The Hub - Entertainment
      </Text>
      <Text style={{ fontSize: 16, color: '#9CA3AF', marginBottom: 20 }}>
        Book local artists and entertainers for your events
      </Text>

      {entertainers.map((entertainer) => (
        <View key={entertainer.id} style={{
          backgroundColor: '#1F2937',
          borderRadius: 12,
          padding: 16,
          marginBottom: 12
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>{entertainer.name}</Text>
              <Text style={{ fontSize: 14, color: '#8B5CF6' }}>{entertainer.type}</Text>
              <Text style={{ fontSize: 14, color: '#9CA3AF' }}>{entertainer.provider} • {entertainer.distance}</Text>
              <Text style={{ fontSize: 14, color: '#8B5CF6', marginTop: 4 }}>{entertainer.rating}</Text>
            </View>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#8B5CF6' }}>{entertainer.price}</Text>
          </View>
          
          <TouchableOpacity
            onPress={() => handleBookEvent(entertainer)}
            style={{
              backgroundColor: '#8B5CF6',
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 8,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>
              Book Event
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

// Main Menu Screen - Enhanced Facebook-style menu
const MainMenuScreen = ({ navigation }: any) => {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FloatingParticles />
      <ScrollView style={{ flex: 1, zIndex: 2 }}>
      {/* Header */}
      <LinearGradient
        colors={[colors.backgroundSecondary, colors.backgroundTertiary, colors.background]}
        style={{ paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <View style={{ 
            width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255, 255, 255, 0.2)',
            justifyContent: 'center', alignItems: 'center', marginRight: 15
          }}>
            {user?.profileImageUrl ? (
              <Image 
                source={{ uri: user.profileImageUrl }} 
                style={{ width: 60, height: 60, borderRadius: 30 }}
              />
            ) : (
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>
                {user?.firstName?.charAt(0) || 'U'}
              </Text>
            )}
          </View>
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>
              {user?.firstName || 'User'} {user?.lastName || ''}
            </Text>
            <Text style={{ fontSize: 14, color: '#B8B8B8' }}>
              {user?.userType === 'dual' ? 'Personal + Business Account' : 'Personal Account'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Menu Options */}
      <View style={{ padding: 20 }}>
        {/* Account Management Section */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 }}>
            Account Management
          </Text>
          
          {[
            { name: 'EditProfile', icon: 'person-circle', label: 'Edit Profile', description: 'Name, bio, address, payment methods' },
            { name: 'Subscription', icon: 'diamond', label: 'MarketPlace Pro', description: user?.userType === 'dual' ? 'Pro features active' : 'Upgrade to dual account' },
          ].map((item, index) => (
            <TouchableOpacity 
              key={index}
              style={{ 
                backgroundColor: item.name === 'Subscription' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                borderRadius: 12, 
                padding: 16, 
                marginBottom: 12,
                borderWidth: 1,
                borderColor: item.name === 'Subscription' ? 'rgba(251, 191, 36, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                flexDirection: 'row',
                alignItems: 'center'
              }}
              onPress={() => navigation.navigate(item.name)}
            >
              <Ionicons 
                name={item.icon as any} 
                size={24} 
                color={item.name === 'Subscription' ? '#FBB800' : '#8B5CF6'} 
                style={{ marginRight: 12 }} 
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 2 }}>
                  {item.label}
                </Text>
                <Text style={{ fontSize: 12, color: '#B8B8B8' }}>
                  {item.description}
                </Text>
              </View>
              {item.name === 'Subscription' && user?.userType !== 'dual' && (
                <View style={{
                  backgroundColor: '#FBB800',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6
                }}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#000' }}>
                    FREE
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

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
            { name: 'Profile', icon: 'person', description: 'View your public profile' },
            { name: 'DeliveryTracking', icon: 'car', description: 'Track your deliveries' },
            { name: 'DeliveryDemo', icon: 'map', description: 'See how delivery routes work' },
            { name: 'DriverJobDescription', icon: 'speedometer', description: 'Apply to drive and earn money' },
            { name: 'SecurityPolicies', icon: 'shield-checkmark', description: 'Platform security & safety' },
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
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
                  {item.name}
                </Text>
                <Text style={{ fontSize: 12, color: '#B8B8B8' }}>
                  {item.description}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  const shareUrl = encodeURIComponent('https://MarketPace.shop');
                  const shareText = encodeURIComponent(`Check out MarketPace ${item.name === 'DriverJobDescription' ? '- Apply to Drive and earn money in your community!' : '- the community-first marketplace revolution!'} #MarketPace #CommunityFirst #LocalCommerce`);
                  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`;
                  
                  if (typeof window !== 'undefined') {
                    window.open(facebookUrl, '_blank');
                  }
                }}
                style={{
                  backgroundColor: '#1877F2',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  marginLeft: 8,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '600' }}>📘</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity 
          style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            borderRadius: 8, 
            padding: 14, 
            marginBottom: 8,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: 'rgba(239, 68, 68, 0.3)'
          }}
          onPress={() => {
            // Demo logout - just refresh the page to reset state
            alert('Logout functionality - in production this would redirect to login');
          }}
        >
          <Ionicons name="log-out" size={20} color="#EF4444" style={{ marginRight: 12 }} />
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#EF4444' }}>
            Log Out
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom padding for floating navigation */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

// Edit Profile Screen
const EditProfileScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [bio, setBio] = useState('');
  const [address, setAddress] = useState('');
  
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0F0B1F' }}>
      {/* Header */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={{ paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>
            Edit Profile
          </Text>
          <TouchableOpacity>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#8B5CF6' }}>
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={{ padding: 20 }}>
        {/* Profile Picture Section */}
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <View style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 15
          }}>
            <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#fff' }}>
              {firstName.charAt(0) || 'U'}
            </Text>
          </View>
          <TouchableOpacity style={{
            backgroundColor: 'rgba(139, 92, 246, 0.2)',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: 'rgba(139, 92, 246, 0.5)'
          }}>
            <Text style={{ color: '#8B5CF6', fontSize: 14, fontWeight: '600' }}>
              Change Photo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information */}
        <View style={{ marginBottom: 30 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 15 }}>
            Personal Information
          </Text>
          
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 14, color: '#B8B8B8', marginBottom: 8 }}>First Name</Text>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 8,
                padding: 12,
                color: '#fff',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)'
              }}
              placeholderTextColor="#666"
            />
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 14, color: '#B8B8B8', marginBottom: 8 }}>Last Name</Text>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 8,
                padding: 12,
                color: '#fff',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)'
              }}
              placeholderTextColor="#666"
            />
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 14, color: '#B8B8B8', marginBottom: 8 }}>Bio</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              placeholder="Tell your community about yourself..."
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 8,
                padding: 12,
                color: '#fff',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                textAlignVertical: 'top'
              }}
              placeholderTextColor="#666"
            />
          </View>
        </View>

        {/* Private Address */}
        <View style={{ marginBottom: 30 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 8 }}>
            Private Address
          </Text>
          <Text style={{ fontSize: 12, color: '#B8B8B8', marginBottom: 15 }}>
            Only you can see this. Used for deliveries and local search.
          </Text>
          
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="123 Main St, Your City, State 12345"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 8,
              padding: 12,
              color: '#fff',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}
            placeholderTextColor="#666"
          />
        </View>

        {/* Payment Methods */}
        <View style={{ marginBottom: 30 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 15 }}>
            Payment Methods
          </Text>
          
          <TouchableOpacity style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 8,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="card" size={20} color="#8B5CF6" style={{ marginRight: 12 }} />
              <Text style={{ color: '#fff', fontSize: 16 }}>Add Payment Method</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B8B8B8" />
          </TouchableOpacity>

          <Text style={{ fontSize: 12, color: '#B8B8B8', textAlign: 'center' }}>
            Securely add credit cards, debit cards, or bank accounts
          </Text>
        </View>
      </View>

      {/* Bottom padding for floating navigation */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

// Subscription Screen
const SubscriptionScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);
  
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0F0B1F' }}>
      {/* Header */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={{ paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>
            MarketPlace Pro
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <View style={{ padding: 20 }}>
        {/* Current Status */}
        <View style={{
          backgroundColor: user?.userType === 'dual' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(251, 191, 36, 0.1)',
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: user?.userType === 'dual' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(251, 191, 36, 0.3)',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons 
              name={user?.userType === 'dual' ? 'checkmark-circle' : 'diamond'} 
              size={24} 
              color={user?.userType === 'dual' ? '#22C55E' : '#FBB800'} 
              style={{ marginRight: 12 }}
            />
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff' }}>
              {user?.userType === 'dual' ? 'Pro Active' : 'Upgrade Available'}
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: '#E5E5E5' }}>
            {user?.userType === 'dual' 
              ? 'You have access to all Pro features including business profiles, analytics, and premium tools.'
              : 'Join our launch campaign and get lifetime Pro access for FREE! Upgrade now to unlock business features.'
            }
          </Text>
        </View>

        {/* Campaign Notice */}
        {user?.userType !== 'dual' && (
          <View style={{
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: 'rgba(139, 92, 246, 0.3)'
          }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#8B5CF6', marginBottom: 8 }}>
              🎉 Launch Campaign Special
            </Text>
            <Text style={{ fontSize: 14, color: '#E5E5E5', lineHeight: 20 }}>
              Sign up now and lock in FREE lifetime Pro access! When the campaign ends, new members will pay $3.99/month. 
              Be part of building stronger communities.
            </Text>
          </View>
        )}

        {/* Pro Features */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 16 }}>
            Pro Features Included
          </Text>
          
          {[
            { icon: 'business', title: 'Business Profile', desc: 'Create shops, services, and entertainment listings' },
            { icon: 'trending-up', title: 'Advanced Analytics', desc: 'Track views, engagement, and sales performance' },
            { icon: 'megaphone', title: 'Promotion Tools', desc: 'Boost listings and pin to top of local feeds' },
            { icon: 'videocam', title: 'Live Streaming', desc: 'Stream events and engage with your community' },
            { icon: 'globe', title: 'Website Integration', desc: 'Connect your existing business website' },
            { icon: 'star', title: 'Priority Support', desc: 'Get faster help and feature requests' }
          ].map((feature, index) => (
            <View key={index} style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255, 255, 255, 0.05)'
            }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12
              }}>
                <Ionicons name={feature.icon as any} size={20} color="#8B5CF6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 2 }}>
                  {feature.title}
                </Text>
                <Text style={{ fontSize: 12, color: '#B8B8B8' }}>
                  {feature.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Upgrade Button */}
        {user?.userType !== 'dual' && (
          <TouchableOpacity
            style={{
              backgroundColor: '#FBB800',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              shadowColor: '#FBB800',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5
            }}
            onPress={async () => {
              setIsUpgrading(true);
              // Handle upgrade logic here
              setTimeout(() => setIsUpgrading(false), 2000);
            }}
            disabled={isUpgrading}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 4 }}>
              {isUpgrading ? 'Upgrading...' : 'Upgrade to Pro - FREE'}
            </Text>
            <Text style={{ fontSize: 12, color: '#000', opacity: 0.8 }}>
              Lifetime access during launch campaign
            </Text>
          </TouchableOpacity>
        )}

        {/* Billing Info */}
        <View style={{ marginTop: 24, padding: 16, backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: 8 }}>
          <Text style={{ fontSize: 14, color: '#B8B8B8', textAlign: 'center', lineHeight: 20 }}>
            Regular price: $3.99/month recurring subscription.{'\n'}
            Cancel anytime. No hidden fees.{'\n'}
            Campaign pricing available for limited time only.
          </Text>
        </View>
      </View>

      {/* Bottom padding for floating navigation */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

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

// Delivery Tracking Screen - Track current and past deliveries with color-coded route positions
const DeliveryTrackingScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState('current');

  const currentDeliveries = [
    {
      id: 'DEL001',
      type: 'purchase',
      item: 'Vintage Guitar',
      seller: 'Mike\'s Music Shop',
      buyer: 'You',
      trackingColor: '#2563EB', // Dark Blue
      routePosition: 3,
      totalStops: 6,
      estimatedArrival: '2:30 PM',
      status: 'In Transit',
      driver: 'Sarah M.',
      cost: '$8.50'
    },
    {
      id: 'DEL002', 
      type: 'sale',
      item: 'Coffee Table',
      seller: 'You',
      buyer: 'Jennifer K.',
      trackingColor: '#DC2626', // Dark Red
      routePosition: 1,
      totalStops: 6,
      estimatedArrival: '1:45 PM',
      status: 'Picked Up',
      driver: 'Sarah M.',
      cost: '$12.25'
    }
  ];

  const pastDeliveries = [
    {
      id: 'DEL003',
      type: 'purchase',
      item: 'Standing Desk',
      seller: 'Office Solutions',
      buyer: 'You',
      deliveredDate: 'Yesterday, 4:20 PM',
      driver: 'Marcus T.',
      cost: '$15.75',
      rating: 5
    },
    {
      id: 'DEL004',
      type: 'sale', 
      item: 'Exercise Bike',
      seller: 'You',
      buyer: 'David R.',
      deliveredDate: 'Dec 23, 2:10 PM',
      driver: 'Lisa P.',
      cost: '$18.50',
      rating: 5
    },
    {
      id: 'DEL005',
      type: 'purchase',
      item: 'Gaming Chair',
      seller: 'TechStore Plus',
      buyer: 'You',
      deliveredDate: 'Dec 20, 11:30 AM',
      driver: 'James W.',
      cost: '$9.25',
      rating: 4
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Picked Up': return '#F59E0B';
      case 'In Transit': return '#10B981';
      case 'Delivered': return '#059669';
      default: return '#6B7280';
    }
  };

  const getCurrentDeliveryCard = (delivery: any) => (
    <View key={delivery.id} style={{
      backgroundColor: '#1F2937',
      borderRadius: 15,
      padding: 20,
      marginBottom: 15,
      borderLeftWidth: 4,
      borderLeftColor: delivery.trackingColor
    }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
          {delivery.item}
        </Text>
        <View style={{
          backgroundColor: getStatusColor(delivery.status),
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 8
        }}>
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
            {delivery.status}
          </Text>
        </View>
      </View>

      {/* Details */}
      <View style={{ marginBottom: 15 }}>
        <Text style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 8 }}>
          {delivery.type === 'purchase' ? `From: ${delivery.seller}` : `To: ${delivery.buyer}`}
        </Text>
        <Text style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 8 }}>
          Driver: {delivery.driver} • Cost: {delivery.cost}
        </Text>
        <Text style={{ color: '#E5E7EB', fontSize: 14, fontWeight: 'bold' }}>
          Estimated Arrival: {delivery.estimatedArrival}
        </Text>
      </View>

      {/* Route Progress */}
      <View style={{ marginBottom: 15 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>
            Route Progress
          </Text>
          <Text style={{ color: delivery.trackingColor, fontSize: 12, fontWeight: 'bold' }}>
            Stop {delivery.routePosition} of {delivery.totalStops}
          </Text>
        </View>
        
        {/* Progress bar */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 8
        }}>
          {Array.from({ length: delivery.totalStops }, (_, index) => (
            <View key={index} style={{
              width: 30,
              height: 8,
              borderRadius: 4,
              backgroundColor: index < delivery.routePosition ? delivery.trackingColor : '#374151'
            }} />
          ))}
        </View>
        
        <Text style={{ color: '#9CA3AF', fontSize: 12, textAlign: 'center' }}>
          Your {delivery.type === 'purchase' ? 'purchase' : 'sale'} tracking color: 
          <Text style={{ color: delivery.trackingColor, fontWeight: 'bold' }}>
            {delivery.trackingColor === '#2563EB' ? ' Dark Blue → Light Blue' : ' Dark Red → Light Red'}
          </Text>
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity style={{
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 8,
          flex: 1,
          marginRight: 8
        }}>
          <Text style={{ color: '#3B82F6', fontSize: 12, textAlign: 'center', fontWeight: 'bold' }}>
            Contact Driver
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={{
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 8,
          flex: 1,
          marginLeft: 8
        }}>
          <Text style={{ color: '#10B981', fontSize: 12, textAlign: 'center', fontWeight: 'bold' }}>
            Track Live
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getPastDeliveryCard = (delivery: any) => (
    <View key={delivery.id} style={{
      backgroundColor: '#1F2937',
      borderRadius: 15,
      padding: 20,
      marginBottom: 15
    }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
          {delivery.item}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {Array.from({ length: 5 }, (_, index) => (
            <Ionicons 
              key={index}
              name={index < delivery.rating ? 'star' : 'star-outline'} 
              size={16} 
              color={index < delivery.rating ? '#F59E0B' : '#6B7280'}
            />
          ))}
        </View>
      </View>

      {/* Details */}
      <Text style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 8 }}>
        {delivery.type === 'purchase' ? `From: ${delivery.seller}` : `To: ${delivery.buyer}`}
      </Text>
      <Text style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 8 }}>
        Driver: {delivery.driver} • Cost: {delivery.cost}
      </Text>
      <Text style={{ color: '#10B981', fontSize: 14, fontWeight: 'bold' }}>
        Delivered: {delivery.deliveredDate}
      </Text>

      {/* Action */}
      <TouchableOpacity style={{
        backgroundColor: 'rgba(107, 114, 128, 0.2)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginTop: 12
      }}>
        <Text style={{ color: '#9CA3AF', fontSize: 12, textAlign: 'center' }}>
          View Receipt
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#0F0B1F' }}>
      {/* Header */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={{ paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              padding: 8,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.1)',
              marginRight: 15
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>
            Delivery Tracking
          </Text>
        </View>
        <Text style={{ color: '#B0B0B0', fontSize: 16 }}>
          Track your purchases and sales in real-time
        </Text>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={{ 
        flexDirection: 'row', 
        margin: 20, 
        backgroundColor: '#1F2937',
        borderRadius: 12,
        padding: 4
      }}>
        <TouchableOpacity
          onPress={() => setActiveTab('current')}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 8,
            backgroundColor: activeTab === 'current' ? '#3B82F6' : 'transparent'
          }}
        >
          <Text style={{ 
            color: activeTab === 'current' ? '#fff' : '#9CA3AF',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            Current Deliveries ({currentDeliveries.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setActiveTab('past')}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 8,
            backgroundColor: activeTab === 'past' ? '#3B82F6' : 'transparent'
          }}
        >
          <Text style={{ 
            color: activeTab === 'past' ? '#fff' : '#9CA3AF',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            Past Deliveries ({pastDeliveries.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
        {activeTab === 'current' ? (
          <>
            {/* Color Legend */}
            <View style={{
              backgroundColor: '#1F2937',
              borderRadius: 12,
              padding: 16,
              marginBottom: 20
            }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
                📍 Color Tracking System
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: '#2563EB',
                    marginBottom: 8
                  }} />
                  <Text style={{ color: '#E5E7EB', fontSize: 12, textAlign: 'center' }}>
                    Your Purchases
                  </Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 11, textAlign: 'center' }}>
                    Dark Blue → Light Blue
                  </Text>
                </View>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: '#DC2626',
                    marginBottom: 8
                  }} />
                  <Text style={{ color: '#E5E7EB', fontSize: 12, textAlign: 'center' }}>
                    Your Sales
                  </Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 11, textAlign: 'center' }}>
                    Dark Red → Light Red
                  </Text>
                </View>
              </View>
            </View>

            {/* Current Deliveries */}
            {currentDeliveries.length > 0 ? (
              currentDeliveries.map(delivery => getCurrentDeliveryCard(delivery))
            ) : (
              <View style={{
                backgroundColor: '#1F2937',
                borderRadius: 15,
                padding: 30,
                alignItems: 'center'
              }}>
                <Ionicons name="car-outline" size={48} color="#6B7280" />
                <Text style={{ color: '#9CA3AF', fontSize: 16, textAlign: 'center', marginTop: 16 }}>
                  No active deliveries
                </Text>
                <Text style={{ color: '#6B7280', fontSize: 14, textAlign: 'center', marginTop: 8 }}>
                  Your purchases and sales will appear here when in transit
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            {/* Past Deliveries */}
            {pastDeliveries.length > 0 ? (
              pastDeliveries.map(delivery => getPastDeliveryCard(delivery))
            ) : (
              <View style={{
                backgroundColor: '#1F2937',
                borderRadius: 15,
                padding: 30,
                alignItems: 'center'
              }}>
                <Ionicons name="checkmark-circle-outline" size={48} color="#6B7280" />
                <Text style={{ color: '#9CA3AF', fontSize: 16, textAlign: 'center', marginTop: 16 }}>
                  No delivery history
                </Text>
                <Text style={{ color: '#6B7280', fontSize: 14, textAlign: 'center', marginTop: 8 }}>
                  Completed deliveries will appear here
                </Text>
              </View>
            )}
          </>
        )}

        {/* Bottom Padding */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

// Delivery Demo Screen - Interactive route system demonstration
const DeliveryDemoScreen = ({ navigation }: any) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const demoSteps = [
    {
      title: "Driver Accepts Route",
      description: "Sarah accepts a 6-item route for the 12pm-3pm time slot",
      earnings: "$32.50",
      details: "6 pickups × $4 + 6 dropoffs × $2 + 8.5 miles × $0.50 = $32.50"
    },
    {
      title: "Optimized Route Planning", 
      description: "AI creates the most efficient path through all 12 stops",
      earnings: "$32.50",
      details: "Route covers: Electronics store → Marketplace pickup → 3 homes → Coffee shop"
    },
    {
      title: "Real-Time Tracking",
      description: "Buyers and sellers see live updates as items move through the route",
      earnings: "$32.50 + tips",
      details: "Color-coded tracking: Dark Blue → Light Blue, Dark Red → Light Red"
    },
    {
      title: "Route Complete",
      description: "All deliveries finished, payment released instantly to driver",
      earnings: "$37.25 total",
      details: "$32.50 base + $4.75 in tips (100% goes to driver)"
    }
  ];

  const animateStep = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((prev) => (prev + 1) % demoSteps.length);
      setIsAnimating(false);
    }, 500);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0F0B1F' }}>
      {/* Header */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={{ paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              padding: 8,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.1)',
              marginRight: 15
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>
            Delivery Demo
          </Text>
        </View>
        <Text style={{ color: '#B0B0B0', fontSize: 16 }}>
          See how our transparent delivery system works
        </Text>
      </LinearGradient>

      {/* Interactive Demo Map */}
      <View style={{ margin: 20 }}>
        <LinearGradient
          colors={['#2D1B69', '#1E1E3F']}
          style={{
            borderRadius: 15,
            padding: 20,
            marginBottom: 20
          }}
        >
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
            Route Simulation
          </Text>
          
          {/* Mock Map Area */}
          <View style={{
            backgroundColor: '#0F0F1F',
            borderRadius: 10,
            height: 200,
            padding: 15,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 15
          }}>
            <Text style={{ color: '#888', fontSize: 16, textAlign: 'center', marginBottom: 10 }}>
              🗺️ Interactive Route Map
            </Text>
            <Text style={{ color: '#666', fontSize: 14, textAlign: 'center' }}>
              Step {currentStep + 1} of {demoSteps.length}
            </Text>
            
            {/* Route visualization */}
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-around',
              width: '100%',
              marginTop: 20
            }}>
              {[1,2,3,4,5,6].map((stop, index) => (
                <View key={index} style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: index <= currentStep ? '#4CAF50' : '#333',
                  opacity: isAnimating ? 0.5 : 1
                }} />
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={animateStep}
            style={{
              backgroundColor: '#FF6B35',
              padding: 12,
              borderRadius: 10,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
              Next Step in Route
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Current Step Details */}
        <LinearGradient
          colors={['#1E3A8A', '#1E40AF']}
          style={{
            borderRadius: 15,
            padding: 20,
            marginBottom: 20
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
              {demoSteps[currentStep].title}
            </Text>
            <Text style={{ color: '#4ADE80', fontSize: 16, fontWeight: 'bold' }}>
              {demoSteps[currentStep].earnings}
            </Text>
          </View>
          <Text style={{ color: '#E5E7EB', fontSize: 14, marginBottom: 10 }}>
            {demoSteps[currentStep].description}
          </Text>
          <Text style={{ color: '#9CA3AF', fontSize: 12 }}>
            {demoSteps[currentStep].details}
          </Text>
        </LinearGradient>

        {/* Pricing Transparency */}
        <View style={{
          backgroundColor: '#1F2937',
          borderRadius: 15,
          padding: 20,
          marginBottom: 20
        }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
            💰 Transparent Pricing
          </Text>
          
          {[
            { label: 'Pickup Fee', amount: '$4.00', detail: 'Per item collected' },
            { label: 'Dropoff Fee', amount: '$2.00', detail: 'Per item delivered' },
            { label: 'Mileage', amount: '$0.50', detail: 'Per mile driven' },
            { label: 'Tips', amount: '100%', detail: 'Go directly to driver' },
            { label: 'Large Items', amount: '+$25', detail: 'Truck/van required' }
          ].map((item, index) => (
            <View key={index} style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 8,
              borderBottomWidth: index < 4 ? 1 : 0,
              borderBottomColor: '#374151'
            }}>
              <View>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>
                  {item.label}
                </Text>
                <Text style={{ color: '#9CA3AF', fontSize: 12 }}>
                  {item.detail}
                </Text>
              </View>
              <Text style={{ color: '#4ADE80', fontSize: 14, fontWeight: 'bold' }}>
                {item.amount}
              </Text>
            </View>
          ))}
        </View>

        {/* Delivery Split Info */}
        <View style={{
          backgroundColor: '#065F46',
          borderRadius: 15,
          padding: 20,
          marginBottom: 20
        }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            🤝 Cost Sharing
          </Text>
          <Text style={{ color: '#D1FAE5', fontSize: 14, lineHeight: 20 }}>
            Delivery costs are split 50/50 between buyer and seller. This ensures everyone shares the cost of bringing the community together through local delivery.
          </Text>
          
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-around',
            marginTop: 15,
            paddingTop: 15,
            borderTopWidth: 1,
            borderTopColor: '#047857'
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#4ADE80', fontSize: 16, fontWeight: 'bold' }}>
                Buyer Pays
              </Text>
              <Text style={{ color: '#D1FAE5', fontSize: 14 }}>
                50% of delivery
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#4ADE80', fontSize: 16, fontWeight: 'bold' }}>
                Seller Pays  
              </Text>
              <Text style={{ color: '#D1FAE5', fontSize: 14 }}>
                50% of delivery
              </Text>
            </View>
          </View>
        </View>

        {/* Community Impact */}
        <View style={{
          backgroundColor: '#7C2D12',
          borderRadius: 15,
          padding: 20
        }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            🏘️ Community Impact
          </Text>
          <Text style={{ color: '#FED7AA', fontSize: 14, lineHeight: 20, marginBottom: 15 }}>
            Every delivery keeps money circulating in your neighborhood and creates local jobs for your neighbors.
          </Text>
          
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            marginTop: 10
          }}>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ color: '#FB923C', fontSize: 20, fontWeight: 'bold' }}>
                $125
              </Text>
              <Text style={{ color: '#FED7AA', fontSize: 12, textAlign: 'center' }}>
                Average weekly driver earnings
              </Text>
            </View>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ color: '#FB923C', fontSize: 20, fontWeight: 'bold' }}>
                6 items
              </Text>
              <Text style={{ color: '#FED7AA', fontSize: 12, textAlign: 'center' }}>
                Max items per route
              </Text>
            </View>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ color: '#FB923C', fontSize: 20, fontWeight: 'bold' }}>
                3 hours
              </Text>
              <Text style={{ color: '#FED7AA', fontSize: 12, textAlign: 'center' }}>
                Time slot duration
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// Security Policies Screen
const SecurityPoliciesScreen = ({ navigation }: any) => {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0F0B1F' }}>
      {/* Header */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={{ paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>
            Security Policies
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <View style={{ padding: 20 }}>
        {/* Security Badge */}
        <View style={{
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: 'rgba(34, 197, 94, 0.3)',
          alignItems: 'center'
        }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16
          }}>
            <Ionicons name="shield-checkmark" size={40} color="#22C55E" />
          </View>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 8, textAlign: 'center' }}>
            Secure & Trusted Platform
          </Text>
          <Text style={{ fontSize: 14, color: '#E5E5E5', textAlign: 'center', lineHeight: 20 }}>
            MarketPlace prioritizes your safety and security. We've implemented multiple layers of protection to ensure a safe trading environment.
          </Text>
        </View>

        {/* Security Features */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 16 }}>
            Security Features
          </Text>
          
          {[
            {
              icon: 'lock-closed',
              title: 'End-to-End Encryption',
              description: 'All your personal data and communications are encrypted using industry-standard protocols.'
            },
            {
              icon: 'card',
              title: 'Secure Payments',
              description: 'Payments processed through Stripe with PCI DSS compliance and fraud protection.'
            },
            {
              icon: 'eye',
              title: 'Identity Verification',
              description: 'Optional verification system for drivers and businesses to build trust in the community.'
            },
            {
              icon: 'people',
              title: 'Community Moderation',
              description: 'Active community reporting and moderation to maintain a safe environment.'
            },
            {
              icon: 'shield',
              title: 'Data Protection',
              description: 'Your personal information is never sold to third parties. Full GDPR compliance.'
            },
            {
              icon: 'location',
              title: 'Location Privacy',
              description: 'Your exact location is private. Only general area is shared for local discovery.'
            }
          ].map((feature, index) => (
            <View key={index} style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255, 255, 255, 0.05)'
            }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12
              }}>
                <Ionicons name={feature.icon as any} size={20} color="#22C55E" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 }}>
                  {feature.title}
                </Text>
                <Text style={{ fontSize: 14, color: '#B8B8B8', lineHeight: 20 }}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Safety Guidelines */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 16 }}>
            Safety Guidelines
          </Text>
          
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 8,
            padding: 16,
            marginBottom: 16
          }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 12 }}>
              For Buyers & Sellers:
            </Text>
            <Text style={{ fontSize: 14, color: '#E5E5E5', lineHeight: 22 }}>
              • Meet in public places for item exchanges{'\n'}
              • Use our in-app messaging system{'\n'}
              • Report suspicious behavior immediately{'\n'}
              • Verify items before completing transactions{'\n'}
              • Trust your instincts - if something feels wrong, walk away
            </Text>
          </View>

          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 8,
            padding: 16
          }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 12 }}>
              For Drivers:
            </Text>
            <Text style={{ fontSize: 14, color: '#E5E5E5', lineHeight: 22 }}>
              • Background checks required for all drivers{'\n'}
              • Valid driver's license and insurance verification{'\n'}
              • Real-time delivery tracking for safety{'\n'}
              • Emergency contact system available{'\n'}
              • Regular safety training and updates
            </Text>
          </View>
        </View>

        {/* Privacy Policy */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 16 }}>
            Privacy & Data
          </Text>
          
          <View style={{
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderRadius: 8,
            padding: 16,
            borderWidth: 1,
            borderColor: 'rgba(139, 92, 246, 0.3)'
          }}>
            <Text style={{ fontSize: 14, color: '#E5E5E5', lineHeight: 22, marginBottom: 12 }}>
              We collect only the minimum data necessary to provide our services:
            </Text>
            <Text style={{ fontSize: 14, color: '#E5E5E5', lineHeight: 22 }}>
              • Profile information for community trust{'\n'}
              • Location data for local discovery (never exact address){'\n'}
              • Transaction data for order processing{'\n'}
              • Communication logs for safety and support
            </Text>
          </View>
        </View>

        {/* Contact Support */}
        <View style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)'
        }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 12 }}>
            Need Help or Want to Report Something?
          </Text>
          <Text style={{ fontSize: 14, color: '#B8B8B8', marginBottom: 16 }}>
            Our safety team is available 24/7 to help with any security concerns or policy questions.
          </Text>
          
          <TouchableOpacity style={{
            backgroundColor: '#22C55E',
            borderRadius: 8,
            padding: 12,
            alignItems: 'center'
          }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>
              Contact Security Team
            </Text>
          </TouchableOpacity>
        </View>

        {/* Community Promise */}
        <View style={{
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          borderRadius: 12,
          padding: 20,
          borderWidth: 1,
          borderColor: 'rgba(251, 191, 36, 0.3)'
        }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FBB800', marginBottom: 12 }}>
            Our Community Promise
          </Text>
          <Text style={{ fontSize: 14, color: '#E5E5E5', lineHeight: 22 }}>
            MarketPlace is built on trust, safety, and community support. We're committed to creating a platform where neighbors can trade, work, and connect with confidence. Your security is our top priority.
          </Text>
        </View>
      </View>

      {/* Bottom padding for floating navigation */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

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
