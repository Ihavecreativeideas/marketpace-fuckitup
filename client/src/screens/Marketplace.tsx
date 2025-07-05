import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const { width } = Dimensions.get('window');

export default function Marketplace({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories/shops'],
    queryFn: () => apiRequest('GET', '/api/categories/shops'),
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['/api/listings', selectedCategory, searchQuery],
    queryFn: () => {
      let url = '/api/listings?';
      if (selectedCategory) url += `categoryId=${selectedCategory}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
      return apiRequest('GET', url);
    },
  });

  const renderListingItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.listingCard}>
      <Image
        source={{
          uri: item.images?.[0] || 'https://pixabay.com/get/g4b02c701fb221a6fc0ba9a0beecefcd9714f81f5068058781d749959c3f2dbdd3bae3a8889ab04d8cefde57a2755b71e4f2be6f007898c6fa0b733c805099de4_1280.jpg',
        }}
        style={styles.listingImage}
      />
      <View style={styles.listingContent}>
        <Text style={styles.listingTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.listingDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.listingFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.listingPrice}>${item.price}</Text>
            {item.isRental && (
              <Badge text="Rental" variant="warning" size="small" />
            )}
          </View>
          <View style={styles.listingMeta}>
            <Text style={styles.listingLocation}>{item.location}</Text>
            <Text style={styles.listingSeller}>
              By {item.user?.firstName} {item.user?.lastName}
            </Text>
          </View>
        </View>
        <View style={styles.listingActions}>
          <Button
            title="Add to Cart"
            onPress={() => handleAddToCart(item.id)}
            size="small"
            style={styles.actionButton}
          />
          <Button
            title="Make Offer"
            onPress={() => handleMakeOffer(item)}
            variant="outline"
            size="small"
            style={styles.actionButton}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleAddToCart = async (listingId: number) => {
    try {
      await apiRequest('POST', '/api/cart', { listingId, quantity: 1 });
      // Show success toast
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleMakeOffer = (listing: any) => {
    // Navigate to offer screen or show modal
    console.log('Make offer for:', listing.title);
  };

  const handleCategoryPress = (categoryId: number | null) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Marketplace</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="cart-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('CreateListing')}
          >
            <Ionicons name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search marketplace..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: null, name: 'All' }, ...categories]}
          keyExtractor={(item) => item.id?.toString() || 'all'}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item.id && styles.selectedCategoryButton,
              ]}
              onPress={() => handleCategoryPress(item.id)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === item.id && styles.selectedCategoryButtonText,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Listings */}
      <FlatList
        data={listings}
        renderItem={renderListingItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listingsContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="storefront-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No items found</Text>
            <Text style={styles.emptyStateSubtitle}>
              Try adjusting your search or browse different categories
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  categoriesSection: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedCategoryButton: {
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedCategoryButtonText: {
    color: 'white',
  },
  listingsContainer: {
    padding: 16,
  },
  listingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listingImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  listingContent: {
    padding: 16,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  listingDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  listingFooter: {
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  listingPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 8,
  },
  listingMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listingLocation: {
    fontSize: 12,
    color: '#666',
  },
  listingSeller: {
    fontSize: 12,
    color: '#666',
  },
  listingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
