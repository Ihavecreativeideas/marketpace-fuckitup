import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Header from '../../components/common/Header';
import CategoryCard from '../../components/marketplace/CategoryCard';
import ListingCard from '../../components/marketplace/ListingCard';
import { colors } from '../../utils/colors';
import { api } from '../../services/api';

export default function HomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { cartItems } = useCart();

  const categories = [
    {
      id: 'shops',
      title: 'Shops',
      icon: 'storefront',
      color: colors.primary,
      description: 'Local businesses and retail stores',
      onPress: () => navigation.navigate('Shops'),
    },
    {
      id: 'services',
      title: 'Services',
      icon: 'construct',
      color: colors.success,
      description: 'Professional services and skilled work',
      onPress: () => navigation.navigate('Services'),
    },
    {
      id: 'hub',
      title: 'The Hub',
      icon: 'play-circle',
      color: colors.warning,
      description: 'Entertainment and events',
      onPress: () => navigation.navigate('Hub'),
    },
  ];

  useEffect(() => {
    loadFeaturedListings();
  }, []);

  const loadFeaturedListings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/marketplace/featured');
      setFeaturedListings(response.data);
    } catch (error) {
      console.error('Error loading featured listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFeaturedListings();
    setRefreshing(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('SearchResults', { query: searchQuery });
    }
  };

  const renderCategoryCard = ({ item }) => (
    <CategoryCard category={item} onPress={item.onPress} />
  );

  const renderListingCard = ({ item }) => (
    <ListingCard
      listing={item}
      onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="MarketPace"
        showCart={true}
        cartItemCount={cartItems.length}
        onCartPress={() => navigation.navigate('Cart')}
        showProfile={true}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={colors.gray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search MarketPace..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
          </View>
          <TouchableOpacity style={styles.filterButton} onPress={handleSearch}>
            <Ionicons name="options" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Welcome{user?.firstName ? `, ${user.firstName}` : ''}!
          </Text>
          <Text style={styles.welcomeSubtext}>
            Discover amazing deals and services in your area
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('CreateListing')}
          >
            <Ionicons name="add-circle" size={24} color={colors.primary} />
            <Text style={styles.quickActionText}>Sell</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('RentListing')}
          >
            <Ionicons name="time" size={24} color={colors.success} />
            <Text style={styles.quickActionText}>Rent</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Services')}
          >
            <Ionicons name="hammer" size={24} color={colors.warning} />
            <Text style={styles.quickActionText}>Services</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Community')}
          >
            <Ionicons name="people" size={24} color={colors.info} />
            <Text style={styles.quickActionText}>Community</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <FlatList
            data={categories}
            renderItem={renderCategoryCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          />
        </View>

        {/* Pro Features Banner */}
        <TouchableOpacity style={styles.proBanner}>
          <View style={styles.proBannerContent}>
            <View style={styles.proBannerIcon}>
              <Ionicons name="star" size={24} color={colors.warning} />
            </View>
            <View style={styles.proBannerText}>
              <Text style={styles.proBannerTitle}>MarketPace Pro</Text>
              <Text style={styles.proBannerSubtitle}>
                Unlock premium features and boost your listings
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray} />
          </View>
        </TouchableOpacity>

        {/* Featured Listings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Listings</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllListings')}>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>
          {featuredListings.length > 0 ? (
            <FlatList
              data={featuredListings}
              renderItem={renderListingCard}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listingsContainer}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="storefront-outline" size={48} color={colors.gray} />
              <Text style={styles.emptyStateText}>No featured listings available</Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => navigation.navigate('CreateListing')}
              >
                <Text style={styles.emptyStateButtonText}>Create First Listing</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <Ionicons name="time-outline" size={20} color={colors.gray} />
            <Text style={styles.activityText}>
              New listings and updates will appear here
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  welcomeSection: {
    padding: 16,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: colors.gray,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: colors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 20,
  },
  quickAction: {
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 12,
    color: colors.text,
    marginTop: 8,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  sectionLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
  },
  listingsContainer: {
    paddingHorizontal: 16,
  },
  proBanner: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  proBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  proBannerIcon: {
    width: 48,
    height: 48,
    backgroundColor: colors.warning + '20',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  proBannerText: {
    flex: 1,
  },
  proBannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  proBannerSubtitle: {
    fontSize: 14,
    color: colors.gray,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.white,
    marginHorizontal: 16,
    borderRadius: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activityText: {
    fontSize: 14,
    color: colors.gray,
    marginLeft: 12,
    flex: 1,
  },
});
