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

export default function ShopsScreen({ navigation }) {
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const { data: listings, isLoading, error, refetch } = useListings({
    category: CATEGORIES.SHOPS,
    subcategory: selectedSubcategory === 'all' ? undefined : selectedSubcategory,
  });

  const subcategories = [
    { id: 'all', name: 'All Shops', icon: 'storefront' },
    { id: 'food', name: 'Food & Drinks', icon: 'restaurant' },
    { id: 'fashion', name: 'Fashion', icon: 'shirt' },
    { id: 'electronics', name: 'Electronics', icon: 'phone-portrait' },
    { id: 'home', name: 'Home & Garden', icon: 'home' },
    { id: 'books', name: 'Books & Media', icon: 'book' },
    { id: 'sports', name: 'Sports & Outdoors', icon: 'basketball' },
    { id: 'health', name: 'Health & Beauty', icon: 'medical' },
    { id: 'toys', name: 'Toys & Games', icon: 'game-controller' },
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
        title="Unable to load shops"
        message={error.message}
        onRetry={refetch}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Shops" 
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
            {listings?.length || 0} items
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
        {/* Listings Grid */}
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

        {/* Empty State */}
        {(!listings || listings.length === 0) && (
          <View style={styles.emptyState}>
            <Ionicons name="storefront-outline" size={64} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No shops found</Text>
            <Text style={styles.emptyText}>
              {selectedSubcategory === 'all' 
                ? 'No shops available in your area yet.'
                : `No ${subcategories.find(c => c.id === selectedSubcategory)?.name.toLowerCase()} shops found.`
              }
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => navigation.navigate('CreateListing')}
            >
              <Text style={styles.emptyButtonText}>Create Shop Listing</Text>
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
  listingsContainer: {
    paddingHorizontal: Spacing.lg,
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
