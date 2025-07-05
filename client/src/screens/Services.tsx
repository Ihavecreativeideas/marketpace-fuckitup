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

export default function Services({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories/services'],
    queryFn: () => apiRequest('GET', '/api/categories/services'),
  });

  const { data: services = [] } = useQuery({
    queryKey: ['/api/listings', selectedCategory, searchQuery, 'services'],
    queryFn: () => {
      let url = '/api/listings?';
      if (selectedCategory) url += `categoryId=${selectedCategory}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
      return apiRequest('GET', url);
    },
  });

  const serviceCategories = [
    { id: 1, name: 'Home Services', icon: 'home', color: '#FF6B6B' },
    { id: 2, name: 'Auto Services', icon: 'car', color: '#4ECDC4' },
    { id: 3, name: 'Personal Care', icon: 'person', color: '#45B7D1' },
    { id: 4, name: 'Professional', icon: 'briefcase', color: '#96CEB4' },
    { id: 5, name: 'Health & Wellness', icon: 'medical', color: '#DDA0DD' },
    { id: 6, name: 'Education', icon: 'school', color: '#F4A261' },
  ];

  const renderServiceItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.serviceCard}>
      <Image
        source={{
          uri: item.images?.[0] || 'https://pixabay.com/get/g092856ba94a69fd9e3e0fe84a7598c1421f23dc507a0937377cf28b9f370faccf5f707d6582fdfc69b1383575396a5708eeaa5925817323dc11474e1aa97d5df_1280.jpg',
        }}
        style={styles.serviceImage}
      />
      <View style={styles.serviceContent}>
        <View style={styles.serviceHeader}>
          <Text style={styles.serviceTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Badge 
            text={item.category?.name || 'Service'} 
            variant="info" 
            size="small" 
          />
        </View>
        <Text style={styles.serviceDescription} numberOfLines={3}>
          {item.description}
        </Text>
        <View style={styles.serviceFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.servicePrice}>
              ${item.price}/{item.rentalPeriod || 'hour'}
            </Text>
            <View style={styles.providerInfo}>
              <Image
                source={{
                  uri: item.user?.profileImageUrl || 'https://via.placeholder.com/24x24',
                }}
                style={styles.providerAvatar}
              />
              <Text style={styles.providerName}>
                {item.user?.firstName} {item.user?.lastName}
              </Text>
            </View>
          </View>
          <View style={styles.serviceActions}>
            <Button
              title="Book Now"
              onPress={() => handleBookService(item)}
              size="small"
              style={styles.actionButton}
            />
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => handleContactProvider(item)}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleBookService = (service: any) => {
    // Navigate to booking screen or add to cart
    console.log('Book service:', service.title);
  };

  const handleContactProvider = (service: any) => {
    // Open chat or contact modal
    console.log('Contact provider for:', service.title);
  };

  const handleCategoryPress = (categoryId: number | null) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Services</Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.navigate('CreateListing')}
        >
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Service Categories */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Popular Categories</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={serviceCategories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryCard, { backgroundColor: item.color }]}
              onPress={() => handleCategoryPress(item.id)}
            >
              <Ionicons name={item.icon as any} size={24} color="white" />
              <Text style={styles.categoryName}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Filter Tags */}
      <View style={styles.filterSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: null, name: 'All Services' }, ...categories]}
          keyExtractor={(item) => item.id?.toString() || 'all'}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedCategory === item.id && styles.selectedFilterButton,
              ]}
              onPress={() => handleCategoryPress(item.id)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedCategory === item.id && styles.selectedFilterButtonText,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Services List */}
      <FlatList
        data={services}
        renderItem={renderServiceItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.servicesContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="construct-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No services found</Text>
            <Text style={styles.emptyStateSubtitle}>
              Try adjusting your search or browse different categories
            </Text>
            <Button
              title="Offer Your Service"
              onPress={() => navigation.navigate('CreateListing')}
              style={styles.offerServiceButton}
            />
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
  headerButton: {
    padding: 8,
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
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  categoryCard: {
    width: 100,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryName: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  filterSection: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedFilterButton: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedFilterButtonText: {
    color: 'white',
  },
  servicesContainer: {
    padding: 16,
  },
  serviceCard: {
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
  serviceImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  serviceContent: {
    padding: 16,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  serviceFooter: {
    marginTop: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
  },
  providerName: {
    fontSize: 12,
    color: '#666',
  },
  serviceActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    marginRight: 8,
  },
  contactButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
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
    marginBottom: 20,
  },
  offerServiceButton: {
    marginTop: 10,
  },
});
