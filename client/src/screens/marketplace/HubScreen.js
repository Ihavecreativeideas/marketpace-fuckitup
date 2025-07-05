import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';
import { useListings } from '../../hooks/useApi';
import { CATEGORIES } from '../../utils/constants';
import ListingCard from '../../components/marketplace/ListingCard';
import Header from '../../components/common/Header';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

export default function HubScreen({ navigation }) {
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const { data: listings, isLoading, error, refetch } = useListings({
    category: CATEGORIES.ENTERTAINMENT,
    subcategory: selectedSubcategory === 'all' ? undefined : selectedSubcategory,
  });

  const subcategories = [
    { id: 'all', name: 'All Entertainment', icon: 'play-circle' },
    { id: 'events', name: 'Events', icon: 'calendar' },
    { id: 'music', name: 'Music & Audio', icon: 'musical-notes' },
    { id: 'gaming', name: 'Gaming', icon: 'game-controller' },
    { id: 'movies', name: 'Movies & TV', icon: 'film' },
    { id: 'books', name: 'Books & Reading', icon: 'book' },
    { id: 'art', name: 'Art & Crafts', icon: 'brush' },
    { id: 'sports', name: 'Sports Events', icon: 'basketball' },
    { id: 'nightlife', name: 'Nightlife', icon: 'wine' },
    { id: 'outdoor', name: 'Outdoor Activities', icon: 'leaf' },
  ];

  const hubFeatures = [
    {
      id: 'livestream',
      title: 'Live Streaming',
      description: 'Watch live events and performances',
      icon: 'videocam',
      color: Colors.error,
      badge: 'LIVE',
    },
    {
      id: 'vr',
      title: 'VR Experiences',
      description: 'Virtual reality entertainment',
      icon: 'glasses',
      color: Colors.secondary,
      badge: 'NEW',
    },
    {
      id: 'ai-reviews',
      title: 'AI Reviews',
      description: 'Smart entertainment recommendations',
      icon: 'sparkles',
      color: Colors.primary,
      badge: 'AI',
    },
    {
      id: 'social',
      title: 'Social Events',
      description: 'Meet people with similar interests',
      icon: 'people',
      color: Colors.success,
      badge: null,
    },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleListingPress = (listing) => {
    navigation.navigate('ListingDetail', { listingId: listing.id });
  };

  const handleFeaturePress = (feature) => {
    Alert.alert(
      feature.title,
      `${feature.description}\n\nThis feature is coming soon!`,
      [{ text: 'OK' }]
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage 
        title="Unable to load entertainment"
        message={error.message}
        onRetry={refetch}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="The Hub" 
        rightIcon="add"
        onRightPress={() => navigation.navigate('CreateListing')}
      />
      
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Entertainment Hub</Text>
          <Text style={styles.heroSubtitle}>
            Discover events, experiences, and entertainment in your area
          </Text>
        </View>

        {/* Hub Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hub Features</Text>
          <View style={styles.featuresGrid}>
            {hubFeatures.map((feature) => (
              <TouchableOpacity
                key={feature.id}
                style={[styles.featureCard, { backgroundColor: feature.color + '10' }]}
                onPress={() => handleFeaturePress(feature)}
              >
                <View style={styles.featureHeader}>
                  <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                    <Ionicons name={feature.icon} size={24} color={Colors.white} />
                  </View>
                  {feature.badge && (
                    <View style={[styles.featureBadge, { backgroundColor: feature.color }]}>
                      <Text style={styles.featureBadgeText}>{feature.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Subcategory Filter */}
        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subcategoriesContainer}
          >
            {subcategories.map((subcategory) => (
              <TouchableOpacity
                key={subcategory.id}
                style={[
                  styles.subcategoryChip,
                  selectedSubcategory === subcategory.id && styles.selectedChip
                ]}
                onPress={() => setSelectedSubcategory(subcategory.id)}
              >
                <Ionicons 
                  name={subcategory.icon} 
                  size={16} 
                  color={selectedSubcategory === subcategory.id ? Colors.white : Colors.textSecondary} 
                />
                <Text style={[
                  styles.subcategoryText,
                  selectedSubcategory === subcategory.id && styles.selectedChipText
                ]}>
                  {subcategory.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Trending Section */}
        {listings && listings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending Now</Text>
              <View style={styles.trendingBadge}>
                <Ionicons name="trending-up" size={16} color={Colors.error} />
                <Text style={styles.trendingText}>HOT</Text>
              </View>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {listings.slice(0, 5).map((listing) => (
                <TouchableOpacity
                  key={listing.id}
                  style={styles.trendingCard}
                  onPress={() => handleListingPress(listing)}
                >
                  <View style={styles.trendingIcon}>
                    <Ionicons name="play-circle" size={32} color={Colors.primary} />
                  </View>
                  <Text style={styles.trendingTitle} numberOfLines={2}>
                    {listing.title}
                  </Text>
                  <Text style={styles.trendingPrice}>
                    ${listing.price}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* All Entertainment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Entertainment</Text>
          <View style={styles.listingsContainer}>
            {listings?.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onPress={handleListingPress}
                style={styles.listingCard}
              />
            ))}
          </View>
        </View>

        {/* Empty State */}
        {(!listings || listings.length === 0) && (
          <View style={styles.emptyState}>
            <Ionicons name="play-circle-outline" size={64} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No entertainment found</Text>
            <Text style={styles.emptyText}>
              {selectedSubcategory === 'all' 
                ? 'No entertainment options available in your area yet.'
                : `No ${subcategories.find(c => c.id === selectedSubcategory)?.name.toLowerCase()} found.`
              }
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => navigation.navigate('CreateListing')}
            >
              <Text style={styles.emptyButtonText}>Create Entertainment</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  heroTitle: {
    ...Typography.h1,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    ...Typography.body,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.borderRadius.sm,
    marginLeft: Spacing.sm,
  },
  trendingText: {
    ...Typography.caption,
    color: Colors.error,
    fontWeight: '700',
    marginLeft: Spacing.xs,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.lg,
    marginBottom: Spacing.md,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Spacing.borderRadius.sm,
  },
  featureBadgeText: {
    color: Colors.white,
    fontSize: 8,
    fontWeight: '700',
  },
  featureTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  featureDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  filterContainer: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  subcategoriesContainer: {
    paddingHorizontal: Spacing.lg,
  },
  subcategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.borderRadius.lg,
    marginRight: Spacing.sm,
  },
  selectedChip: {
    backgroundColor: Colors.primary,
  },
  subcategoryText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
    fontWeight: '500',
  },
  selectedChipText: {
    color: Colors.white,
  },
  horizontalScroll: {
    paddingRight: Spacing.lg,
  },
  trendingCard: {
    width: 120,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.lg,
    marginRight: Spacing.md,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendingIcon: {
    marginBottom: Spacing.sm,
  },
  trendingTitle: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  trendingPrice: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '700',
  },
  listingsContainer: {
    paddingTop: Spacing.md,
  },
  listingCard: {
    marginBottom: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
  },
  emptyButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
});
