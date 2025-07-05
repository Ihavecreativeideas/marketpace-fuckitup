import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../styles/colors';

// Screen imports
import HomeScreen from '../screens/marketplace/HomeScreen';
import ShopsScreen from '../screens/marketplace/ShopsScreen';
import ServicesScreen from '../screens/marketplace/ServicesScreen';
import HubScreen from '../screens/marketplace/HubScreen';
import CommunityScreen from '../screens/community/CommunityScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ListingDetailScreen from '../screens/marketplace/ListingDetailScreen';
import CreateListingScreen from '../screens/marketplace/CreateListingScreen';
import CartScreen from '../screens/marketplace/CartScreen';
import CheckoutScreen from '../screens/marketplace/CheckoutScreen';
import DriverDashboardScreen from '../screens/driver/DriverDashboardScreen';
import DriverApplicationScreen from '../screens/driver/DriverApplicationScreen';
import DeliveryRouteScreen from '../screens/driver/DeliveryRouteScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import RentalsScreen from '../screens/rentals/RentalsScreen';
import ProMembershipScreen from '../screens/pro/ProMembershipScreen';
import BusinessProfileScreen from '../screens/profile/BusinessProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack Navigators for each tab
function HomeStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} />
      <Stack.Screen name="CreateListing" component={CreateListingScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Rentals" component={RentalsScreen} />
      <Stack.Screen name="ProMembership" component={ProMembershipScreen} />
    </Stack.Navigator>
  );
}

function ShopsStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ShopsMain" component={ShopsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} />
    </Stack.Navigator>
  );
}

function ServicesStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ServicesMain" component={ServicesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} />
    </Stack.Navigator>
  );
}

function HubStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HubMain" component={HubScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} />
    </Stack.Navigator>
  );
}

function CommunityStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CommunityMain" component={CommunityScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BusinessProfile" component={BusinessProfileScreen} />
      <Stack.Screen name="DriverDashboard" component={DriverDashboardScreen} />
      <Stack.Screen name="DriverApplication" component={DriverApplicationScreen} />
      <Stack.Screen name="DeliveryRoute" component={DeliveryRouteScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    </Stack.Navigator>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Shops') {
            iconName = focused ? 'storefront' : 'storefront-outline';
          } else if (route.name === 'Services') {
            iconName = focused ? 'build' : 'build-outline';
          } else if (route.name === 'Hub') {
            iconName = focused ? 'play-circle' : 'play-circle-outline';
          } else if (route.name === 'Community') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.lightGray,
          height: 85,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Shops" component={ShopsStackNavigator} />
      <Tab.Screen name="Services" component={ServicesStackNavigator} />
      <Tab.Screen name="Hub" component={HubStackNavigator} />
      <Tab.Screen name="Community" component={CommunityStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
}
