import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
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

// Create a simple demo auth context
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
});

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthContext.Provider value={{
      user: demoUser,
      isLoading: false,
      isAuthenticated: true,
    }}>
      {children}
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

const queryClient = null; // Simplified for demo
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Sign Up / Login Screen
const SignUpLoginScreen = ({ route, navigation }: any) => {
  const mode = route?.params?.mode || 'signup';
  const isSignUp = mode === 'signup';
  const [showEmailForm, setShowEmailForm] = React.useState(false);
  const [selectedMethod, setSelectedMethod] = React.useState('');

  const handleAuthMethod = (method: string) => {
    setSelectedMethod(method);
    
    if (method === 'email') {
      setShowEmailForm(true);
    } else {
      setShowEmailForm(false);
      // Simulate authentication success for demo
      console.log(`Authenticating with ${method}...`);
      // Here you would integrate with actual auth providers
      // For now, just navigate back to show the campaign page
      navigation.navigate('CampaignLanding');
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
            onPress={() => handleAuthMethod('email-submit')}
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

const CampaignLandingScreen = ({ navigation }: any) => (
  <ScrollView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
    {/* Hero Section */}
    <LinearGradient
      colors={['#667eea', '#764ba2']}
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
      colors={['#ff6b6b', '#ffa726']}
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

    {/* Call to Action */}
    <View style={{ padding: 24, alignItems: 'center' }}>
      <TouchableOpacity 
        style={{ width: '100%', marginBottom: 16 }}
        onPress={() => navigation.navigate('SignUpLogin', { mode: 'signup' })}
      >
        <LinearGradient
          colors={['#4CAF50', '#45a049']}
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
        style={{ paddingVertical: 12, paddingHorizontal: 24 }}
        onPress={() => navigation.navigate('SignUpLogin', { mode: 'login' })}
      >
        <Text style={{ fontSize: 16, color: '#667eea', textAlign: 'center' }}>
          Already a Member? Log In
        </Text>
      </TouchableOpacity>
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
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'circle';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.backgroundSecondary,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Marketplace" component={MarketplaceStack} />
      <Tab.Screen name="Community" component={() => <SimpleScreen title="Community" />} />
      <Tab.Screen name="Deliveries" component={DeliveryStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

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
