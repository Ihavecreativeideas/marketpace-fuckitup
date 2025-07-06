import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FuturisticBackground from '../components/FuturisticBackground';
import GlassCard from '../components/GlassCard';
import FuturisticButton from '../components/FuturisticButton';
import { colors } from '../../../src/utils/colors';

interface GuestMarketplaceProps {
  navigation: any;
}

// Mock marketplace data for guest view
const mockListings = [
  {
    id: 1,
    title: "Vintage Bicycle",
    price: 85,
    category: "for-sale",
    location: "0.3 miles away",
    image: "🚲",
    seller: "Local Seller"
  },
  {
    id: 2,
    title: "Power Drill Rental",
    price: 15,
    category: "for-rent",
    location: "0.8 miles away", 
    image: "🔧",
    seller: "Tool Shop"
  },
  {
    id: 3,
    title: "Garden Cleanup Service",
    price: 40,
    category: "services",
    location: "1.2 miles away",
    image: "🌱",
    seller: "Green Thumb Co"
  },
  {
    id: 4,
    title: "Local Jazz Night",
    price: 12,
    category: "events",
    location: "0.5 miles away",
    image: "🎷",
    seller: "Blue Note Cafe"
  }
];

const GuestMarketplace: React.FC<GuestMarketplaceProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('for-sale');
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);
  const [promptAction, setPromptAction] = useState('');

  const tabs = [
    { id: 'for-sale', title: 'For Sale', icon: 'storefront' },
    { id: 'for-rent', title: 'For Rent', icon: 'time' },
    { id: 'services', title: 'Services', icon: 'construct' },
    { id: 'events', title: 'Events', icon: 'musical-notes' }
  ];

  const filteredListings = mockListings.filter(item => item.category === activeTab);

  const handleGuestAction = (action: string) => {
    setPromptAction(action);
    setShowSignUpPrompt(true);
  };

  const renderListingItem = ({ item }: { item: any }) => (
    <GlassCard style={{ margin: 10, padding: 15 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <Text style={{ fontSize: 40, marginRight: 15 }}>{item.image}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: 'bold', 
            color: colors.text,
            marginBottom: 5 
          }}>
            {item.title}
          </Text>
          <Text style={{ 
            fontSize: 20, 
            color: colors.accent,
            fontWeight: '600',
            marginBottom: 3
          }}>
            ${item.price}
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>
            {item.location} • {item.seller}
          </Text>
        </View>
      </View>
      
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: colors.accent + '20',
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.accent + '40'
          }}
          onPress={() => handleGuestAction('view details')}
        >
          <Text style={{ color: colors.accent, fontWeight: '600' }}>
            View Details
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: colors.accent,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center'
          }}
          onPress={() => handleGuestAction('add to cart')}
        >
          <Text style={{ color: colors.surface, fontWeight: '600' }}>
            Add to Cart
          </Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );

  return (
    <FuturisticBackground>
      <View style={{ flex: 1 }}>
        {/* Guest Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 20,
          paddingTop: 60
        }}>
          <View>
            <Text style={{ 
              fontSize: 24, 
              fontWeight: 'bold', 
              color: colors.text 
            }}>
              MarketPlace
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 5
            }}>
              <Ionicons name="location" size={16} color={colors.accent} />
              <Text style={{ 
                fontSize: 14, 
                color: colors.accent,
                marginLeft: 5,
                fontWeight: '500'
              }}>
                Seattle, WA (Guest Mode)
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            onPress={() => navigation.navigate('SignUpLogin', { mode: 'signup' })}
            style={{
              backgroundColor: colors.accent,
              paddingHorizontal: 15,
              paddingVertical: 8,
              borderRadius: 20
            }}
          >
            <Text style={{ 
              color: colors.surface, 
              fontWeight: '600',
              fontSize: 14
            }}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ maxHeight: 60 }}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={{
                backgroundColor: activeTab === tab.id ? colors.accent : 'transparent',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 25,
                marginRight: 10,
                borderWidth: 1,
                borderColor: activeTab === tab.id ? colors.accent : colors.accent + '40',
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={18} 
                color={activeTab === tab.id ? colors.surface : colors.accent}
                style={{ marginRight: 8 }}
              />
              <Text style={{
                color: activeTab === tab.id ? colors.surface : colors.accent,
                fontWeight: '600',
                fontSize: 14
              }}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Action Buttons */}
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: 20,
          paddingVertical: 15,
          gap: 10
        }}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: colors.accent + '20',
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.accent + '40'
            }}
            onPress={() => handleGuestAction('post an item')}
          >
            <Text style={{ color: colors.accent, fontWeight: '600' }}>
              + Post Item
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              backgroundColor: colors.accent + '20',
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.accent + '40',
              minWidth: 50
            }}
            onPress={() => handleGuestAction('search')}
          >
            <Ionicons name="search" size={20} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Listings */}
        <FlatList
          data={filteredListings}
          renderItem={renderListingItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />

        {/* Guest Bottom Navigation */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: colors.surface + 'CC',
          paddingVertical: 15,
          paddingHorizontal: 20,
          borderTopWidth: 1,
          borderTopColor: colors.accent + '20'
        }}>
          {[
            { name: 'Home', icon: 'home', active: false },
            { name: 'Marketplace', icon: 'storefront', active: true },
            { name: 'Community', icon: 'people', active: false },
            { name: 'Deliveries', icon: 'bicycle', active: false },
            { name: 'Menu', icon: 'menu', active: false }
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 5
              }}
              onPress={() => handleGuestAction(`navigate to ${item.name}`)}
            >
              <Ionicons 
                name={item.icon as any} 
                size={24} 
                color={item.active ? colors.accent : colors.textSecondary} 
              />
              <Text style={{
                fontSize: 12,
                color: item.active ? colors.accent : colors.textSecondary,
                marginTop: 4,
                fontWeight: item.active ? '600' : '400'
              }}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Up Prompt Modal */}
        {showSignUpPrompt && (
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
            <GlassCard style={{ margin: 20, padding: 25, alignItems: 'center' }}>
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: colors.accent + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 20
              }}>
                <Ionicons name="person-add" size={30} color={colors.accent} />
              </View>

              <Text style={{ 
                fontSize: 24, 
                fontWeight: 'bold', 
                color: colors.text,
                textAlign: 'center',
                marginBottom: 15
              }}>
                Join MarketPlace
              </Text>
              
              <Text style={{ 
                fontSize: 16, 
                color: colors.textSecondary,
                textAlign: 'center',
                marginBottom: 25,
                lineHeight: 22
              }}>
                To {promptAction}, create an account and become part of your local community!
              </Text>

              <View style={{ flexDirection: 'row', gap: 15 }}>
                <FuturisticButton
                  title="Sign Up Now"
                  onPress={() => {
                    setShowSignUpPrompt(false);
                    navigation.navigate('SignUpLogin', { mode: 'signup' });
                  }}
                  variant="primary"
                  size="medium"
                  glowEffect={true}
                />
                <FuturisticButton
                  title="Keep Browsing"
                  onPress={() => setShowSignUpPrompt(false)}
                  variant="secondary"
                  size="medium"
                />
              </View>

              <Text style={{
                fontSize: 12,
                color: colors.textSecondary,
                textAlign: 'center',
                marginTop: 15,
                fontStyle: 'italic'
              }}>
                Free to join • Support local businesses
              </Text>
            </GlassCard>
          </View>
        )}
      </View>
    </FuturisticBackground>
  );
};

export default GuestMarketplace;