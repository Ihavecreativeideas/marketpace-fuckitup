import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

// Simple placeholder screens to prevent import errors
import { Text } from 'react-native';

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

const queryClient = new QueryClient();
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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
      <Tab.Screen name="Home" component={() => <SimpleScreen title="Home" />} />
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

  // For now, show a futuristic welcome screen
  return (
    <NavigationContainer>
      <FuturisticBackground particleCount={30} glowIntensity="strong">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <FuturisticLogo size="large" animated={true} showTagline={true} />
          
          <GlassCard style={{ marginTop: 40, alignItems: 'center', width: '100%' }}>
            <Text style={{ 
              fontSize: 28, 
              fontWeight: 'bold', 
              color: colors.text,
              textAlign: 'center',
              marginBottom: 15
            }}>
              Welcome to the Future
            </Text>
            <Text style={{ 
              fontSize: 16, 
              color: colors.textSecondary,
              textAlign: 'center',
              marginBottom: 30,
              lineHeight: 24
            }}>
              Experience the next generation of community marketplace with cutting-edge technology
            </Text>
            
            <FuturisticButton
              title="Start Onboarding"
              onPress={() => {}}
              variant="primary"
              size="large"
              glowEffect={true}
              style={{ marginBottom: 15, width: '100%' }}
            />
            
            <FuturisticButton
              title="Explore as Guest"
              onPress={() => {}}
              variant="outline"
              size="medium"
              glowEffect={false}
              style={{ width: '100%' }}
            />
          </GlassCard>
          
          <OnboardingStack />
        </View>
      </FuturisticBackground>
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
