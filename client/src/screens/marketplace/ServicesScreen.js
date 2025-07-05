import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  TouchableOpacity,
  SafeAreaView
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

export default function ServicesScreen({ navigation }) {
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const { data: listings, isLoading, error, refetch } = useListings({
    category: CATEGORIES.SERVICES,
    subcategory: selectedSubcategory === 'all' ? undefined : selectedSubcategory,
  });

  const subcategories = [
    { id: 'all', name: 'All Services', icon: 'construct' },
    { id: 'home', name: 'Home Services', icon: 'home' },
    { id: 'automotive', name: 'Automotive', icon: 'car' },
    { id: 'beauty', name: 'Beauty & Wellness', icon: 'cut' },
    { id: 'tutoring', name: 'Tutoring', icon: 'school' },
    { id: 'pet', name: 'Pet Services', icon: 'paw' },
    { id: 'tech', name: 'Tech Support', icon: 'phone-portrait' },
    { id: 'cleaning', name: 'Cleaning', icon: 'brush' },
    { id: 'photography', name: 'Photography', icon: 'camera' },
    { id: 'legal', name: 'Legal Services', icon: 'document-text' },
    { id: 'fitness', name: 'Fitness', icon: 'barbell' },
    { id: 'catering', name: 'Catering', icon: 'restaurant' },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleListingPress = (listing) => {
    navigation.navigate('ListingDetail', { listingId: listing.id });
  };

  const handleFilterPress = () => {
    // TODO: Implement filter modal
    console.log('Filter pressed');
  };

  const handleSortPress = () => {
    // TODO: Implement sort modal
    console.log('Sort pressed');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage 
        title="Unable to load services"
        message={error.message}
        onRetry={refetch}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Services" 
        rightIcon="add"
        onRightPress={() => navigation.navigate('CreateListing')}
      />
      
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

      {/* Filter and Sort Bar */}
      <View style={styles.controlsBar}>
        <TouchableOpacity style={styles.controlButton} onPress={handleFilterPress}>
          <Ionicons name="filter" size={20} color={Colors.textSecondary} />
          <Text style={styles.controlText}>Filter</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={handleSortPress}>
          <Ionicons name="swap-vertical" size={20} color={Colors.textSecondary} />
          <Text style={styles.controlText}>Sort</Text>
        </TouchableOpacity>
        
        <View style={styles.resultsCount}>
          <Text style={styles.resultsText}>
            {listings?.length || 0} services
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Featured Services */}
        {listings && listings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured Services</Text>
            <View style={styles.featuredContainer}>
              {listings.slice(0, 2).map((listing) => (
                <TouchableOpacity
                  key={listing.id}
                  style={styles.featuredCard}
                  onPress={() => handleListingPress(listing)}
                >
                  <View style={styles.featuredIcon}>
                    <Ionicons name="star" size={24} color={Colors.warning} />
                  </View>
                  <Text style={styles.featuredTitle} numberOfLines={2}>
                    {listing.title}
                  </Text>
                  <Text style={styles.featuredPrice}>
                    ${listing.price}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* All Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Services</Text>
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
            <Ionicons name="construct-outline" size={64} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No services found</Text>
            <Text style={styles.emptyText}>
              {selectedSubcategory === 'all' 
                ? 'No services available in your area yet.'
                : `No ${subcategories.find(c => c.id === selectedSubcategory)?.name.toLowerCase()} services found.`
              }
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => navigation.navigate('CreateListing')}
            >
              <Text style={styles.emptyButtonText}>Offer Your Service</Text>
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
  filterContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  subcategoriesContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
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
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    marginRight: Spacing.sm,
  },
  controlText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
    fontSize: 14,
  },
  resultsCount: {
    flex: 1,
    alignItems: 'flex-end',
  },
  resultsText: {
    ...Typography.body,
    color: Colors.textTertiary,
    fontSize: 14,
  },
  content: {
    flex: 1,
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
  featuredContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  featuredCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.lg,
    marginHorizontal: Spacing.xs,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  featuredTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  featuredPrice: {
    ...Typography.h3,
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
