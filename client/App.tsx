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

import { AuthProvider, useAuth } from './src/context/AuthContext';
import FullLanding from './src/screens/FullLanding';
import SimpleHome from './src/screens/SimpleHome';
import AuthScreen from './src/screens/AuthScreen';
import TestScreen from './src/screens/TestScreen';
import Home from './src/screens/Home';
import FloatingNavigation from './src/components/FloatingNavigation';
import Marketplace from './src/screens/Marketplace';
import Services from './src/screens/Services';
import TheHub from './src/screens/TheHub';
import Community from './src/screens/Community';
import Deliveries from './src/screens/Deliveries';
import CommunityHome from './src/screens/CommunityHome';
import Profile from './src/screens/Profile';
import DriverDashboard from './src/screens/DriverDashboard';
import AdminDashboard from './src/screens/AdminDashboard';
import DriverApplication from './src/screens/DriverApplication';
import CreateListing from './src/screens/CreateListing';
import Cart from './src/screens/Cart';
import Checkout from './src/screens/Checkout';
import Subscribe from './src/screens/Subscribe';

// New onboarding screens
import ProfileSetupScreen from './src/screens/onboarding/ProfileSetupScreen';
import AccountTypeSelectionScreen from './src/screens/onboarding/AccountTypeSelectionScreen';
import BusinessSetupScreen from './src/screens/onboarding/BusinessSetupScreen';
import OnboardingCompleteScreen from './src/screens/onboarding/OnboardingCompleteScreen';

const queryClient = new QueryClient();
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MarketplaceStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MarketplaceHome" component={Marketplace} options={{ headerShown: false }} />
      <Stack.Screen name="CreateListing" component={CreateListing} options={{ title: 'Create Listing' }} />
      <Stack.Screen name="Cart" component={Cart} options={{ title: 'Cart' }} />
      <Stack.Screen name="Checkout" component={Checkout} options={{ title: 'Checkout' }} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProfileHome" component={Profile} options={{ headerShown: false }} />
      <Stack.Screen name="DriverApplication" component={DriverApplication} options={{ title: 'Driver Application' }} />
      <Stack.Screen name="DriverDashboard" component={DriverDashboard} options={{ title: 'Driver Dashboard' }} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ title: 'Admin Dashboard' }} />
      <Stack.Screen name="Subscribe" component={Subscribe} options={{ title: 'MarketPace Pro' }} />
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
          } else if (route.name === 'Services') {
            iconName = focused ? 'construct' : 'construct-outline';
          } else if (route.name === 'TheHub') {
            iconName = focused ? 'videocam' : 'videocam-outline';
          } else if (route.name === 'Community') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'circle';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Marketplace" component={MarketplaceStack} />
      <Tab.Screen name="Services" component={Services} />
      <Tab.Screen name="TheHub" component={TheHub} />
      <Tab.Screen name="Community" component={Community} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

// Create the onboarding stack
function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="AccountTypeSelection" component={AccountTypeSelectionScreen} />
      <Stack.Screen name="BusinessSetup" component={BusinessSetupScreen} />
      <Stack.Screen name="OnboardingComplete" component={OnboardingCompleteScreen} />
    </Stack.Navigator>
  );
}

function AppContent() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [currentScreen, setCurrentScreen] = React.useState('landing'); // 'landing', 'auth', 'app'
  const [activeTab, setActiveTab] = React.useState('Home');

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

  // Show landing/auth flow for unauthenticated users
  if (currentScreen === 'landing') {
    return (
      <FullLanding 
        onEnterApp={() => setCurrentScreen('app')}
        onShowAuth={() => setCurrentScreen('auth')}
      />
    );
  }

  if (currentScreen === 'auth') {
    return (
      <AuthScreen
        onBack={() => setCurrentScreen('landing')}
        onSuccess={() => setCurrentScreen('app')}
      />
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'Home':
        return <CommunityHome />;
      case 'Marketplace':
        return <TestScreen />;
      case 'Community':
        return <Community />;
      case 'Deliveries':
        return <Deliveries />;
      case 'Menu':
        return <TestScreen />;
      default:
        return <CommunityHome />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {renderScreen()}
      <FloatingNavigation
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <StatusBar style="auto" />
            <AppContent />
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
