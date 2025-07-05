import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';
import { useAuth } from '../../hooks/useAuth';
import { useListings } from '../../hooks/useApi';
import ListingCard from '../../components/marketplace/ListingCard';
import CategoryTabs from '../../components/marketplace/CategoryTabs';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { data: listings, isLoading, error, refetch } = useListings({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleListingPress = (listing) => {
    navigation.navigate('ListingDetail', { listingId: listing.id });
  };

  const handleCreateListing = () => {
    navigation.navigate('CreateListing');
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      Alert.alert('Search', `Searching for: ${searchQuery}`);
    }
  };

  const handleCartPress = () => {
    navigation.navigate('Cart');
  };

  const handleRentalsPress = () => {
    navigation.navigate('Rentals');
  };

  const handleProPress = () => {
    navigation.navigate('ProMembership');
  };

  const quickActions = [
    { 
      title: 'Create Listing', 
      icon: 'add-circle', 
      color: Colors.primary,
      onPress: handleCreateListing 
    },
    { 
      title: 'Rent Items', 
      icon: 'calendar', 
      color: Colors.secondary,
      onPress: handleRentalsPress 
    },
    { 
      title: 'Pro Features', 
      icon: 'star', 
      color: Colors.warning,
      onPress: handleProPress 
    },
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage 
        title="Unable to load listings"
        message={error.message}
        onRetry={refetch}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>
            Hello, {user?.firstName || 'User'}!
          </Text>
          <Text style={styles.subtitle}>Find what you need nearby</Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} onPress={handleCartPress}>
            <Ionicons name="bag" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search marketplace..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Tabs */}
      <CategoryTabs
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.quickAction, { backgroundColor: action.color + '10' }]}
              onPress={action.onPress}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                <Ionicons name={action.icon} size={24} color={Colors.white} />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Featured Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Items</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {listings?.slice(0, 3).map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onPress={handleListingPress}
              style={styles.listingCard}
            />
          ))}
        </View>

        {/* Recent Listings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Listings</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {listings?.slice(3).map((listing) => (
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
            <Text style={styles.emptyTitle}>No listings found</Text>
            <Text style={styles.emptyText}>
              Be the first to create a listing in your area!
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleCreateListing}>
              <Text style={styles.emptyButtonText}>Create Listing</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  headerRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconButton: {
    padding: Spacing.sm,
    borderRadius: Spacing.borderRadius.md,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: Spacing.borderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Spacing.borderRadius.lg,
    marginHorizontal: Spacing.xs,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  actionTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  sectionLink: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
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
