import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/marketplace/HomeScreen';
import ShopsScreen from '../screens/marketplace/ShopsScreen';
import ServicesScreen from '../screens/marketplace/ServicesScreen';
import HubScreen from '../screens/marketplace/HubScreen';
import CommunityScreen from '../screens/community/CommunityScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import BusinessProfileScreen from '../screens/profile/BusinessProfileScreen';
import DriverDashboardScreen from '../screens/driver/DriverDashboardScreen';
import DriverApplicationScreen from '../screens/driver/DriverApplicationScreen';
import RouteScreen from '../screens/driver/RouteScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ListingDetailScreen from '../screens/marketplace/ListingDetailScreen';
import CreateListingScreen from '../screens/marketplace/CreateListingScreen';
import CartScreen from '../screens/marketplace/CartScreen';
import CheckoutScreen from '../screens/marketplace/CheckoutScreen';
import { colors } from '../utils/colors';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MarketplaceStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Shops" component={ShopsScreen} />
      <Stack.Screen name="Services" component={ServicesScreen} />
      <Stack.Screen name="Hub" component={HubScreen} />
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} />
      <Stack.Screen name="CreateListing" component={CreateListingScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="BusinessProfile" component={BusinessProfileScreen} />
    </Stack.Navigator>
  );
}

function DriverStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DriverDashboard" component={DriverDashboardScreen} />
      <Stack.Screen name="DriverApplication" component={DriverApplicationScreen} />
      <Stack.Screen name="Route" component={RouteScreen} />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  const { user } = useAuth();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Marketplace') {
            iconName = focused ? 'storefront' : 'storefront-outline';
          } else if (route.name === 'Community') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Driver') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Admin') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.lightGray,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Marketplace" component={MarketplaceStack} />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="Driver" component={DriverStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
      {user?.isAdmin && (
        <Tab.Screen name="Admin" component={AdminDashboardScreen} />
      )}
    </Tab.Navigator>
  );
}
