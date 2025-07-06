import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FuturisticBackground from '../components/FuturisticBackground';
import FuturisticLogo from '../components/FuturisticLogo';
import GlassCard from '../components/GlassCard';
import FuturisticButton from '../components/FuturisticButton';
import { colors } from '../../src/utils/colors';

interface GuestLocationSetupProps {
  navigation: any;
}

const GuestLocationSetup: React.FC<GuestLocationSetupProps> = ({ navigation }) => {
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  const requestLocationPermission = async () => {
    setIsRequestingLocation(true);
    
    try {
      // Simulate location permission request
      // In a real app, this would use expo-location
      console.log('Requesting location permission for guest user...');
      
      // Simulate permission granted after delay
      setTimeout(() => {
        setLocationPermissionGranted(true);
        setIsRequestingLocation(false);
        Alert.alert(
          'Location Access Granted',
          'Great! Now you can explore MarketPlace in your local area as a guest.',
          [
            {
              text: 'Start Exploring',
              onPress: () => navigation.navigate('GuestMarketplace')
            }
          ]
        );
      }, 2000);
      
    } catch (error) {
      setIsRequestingLocation(false);
      Alert.alert(
        'Location Permission Required',
        'MarketPlace needs location access to show you local listings and opportunities in your area.',
        [
          { text: 'Try Again', onPress: requestLocationPermission },
          { text: 'Cancel', onPress: () => navigation.goBack() }
        ]
      );
    }
  };

  return (
    <FuturisticBackground>
      <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
        <FuturisticLogo size="large" animated={true} />
        
        <GlassCard style={{ marginTop: 40, alignItems: 'center', padding: 30 }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.accent + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20
          }}>
            <Ionicons name="location" size={40} color={colors.accent} />
          </View>

          <Text style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: colors.text,
            textAlign: 'center',
            marginBottom: 15
          }}>
            Welcome, Guest!
          </Text>

          <Text style={{
            fontSize: 18,
            color: colors.textSecondary,
            textAlign: 'center',
            marginBottom: 25,
            lineHeight: 24
          }}>
            To show you the best local listings, MarketPlace needs access to your location.
          </Text>

          <View style={{
            backgroundColor: colors.accent + '10',
            padding: 15,
            borderRadius: 10,
            marginBottom: 25,
            borderWidth: 1,
            borderColor: colors.accent + '30'
          }}>
            <Text style={{
              color: colors.accent,
              fontSize: 14,
              textAlign: 'center',
              fontWeight: '500'
            }}>
              As a guest, you can browse all listings and features but cannot purchase or post items without signing up.
            </Text>
          </View>

          {!locationPermissionGranted ? (
            <FuturisticButton
              title={isRequestingLocation ? "Requesting Location..." : "Allow Location Access"}
              onPress={requestLocationPermission}
              variant="primary"
              size="large"
              glowEffect={true}
              disabled={isRequestingLocation}
              icon={isRequestingLocation ? "hourglass" : "location"}
            />
          ) : (
            <View style={{ alignItems: 'center' }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 20
              }}>
                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                <Text style={{
                  color: colors.success,
                  fontSize: 16,
                  fontWeight: '600',
                  marginLeft: 8
                }}>
                  Location Access Granted
                </Text>
              </View>
              
              <FuturisticButton
                title="Start Exploring MarketPlace"
                onPress={() => navigation.navigate('GuestMarketplace')}
                variant="primary"
                size="large"
                glowEffect={true}
                icon="rocket"
              />
            </View>
          )}

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              marginTop: 20,
              padding: 10
            }}
          >
            <Text style={{
              color: colors.textSecondary,
              fontSize: 14,
              textAlign: 'center'
            }}>
              Back to Sign Up
            </Text>
          </TouchableOpacity>
        </GlassCard>

        <View style={{
          marginTop: 30,
          alignItems: 'center'
        }}>
          <Text style={{
            color: colors.textSecondary,
            fontSize: 12,
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            Your location is only used to show relevant local listings.{'\n'}
            MarketPlace respects your privacy.
          </Text>
        </View>
      </View>
    </FuturisticBackground>
  );
};

export default GuestLocationSetup;