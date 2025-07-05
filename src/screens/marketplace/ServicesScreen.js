import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/common/Header';
import ListingCard from '../../components/marketplace/ListingCard';
import { colors } from '../../utils/colors';
import { api } from '../../services/api';

export default function ServicesScreen({ navigation }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Services', icon: 'construct' },
    { id: 'cleaning', name: 'Cleaning', icon: 'sparkles' },
    { id: 'repairs', name: 'Repairs', icon: 'build' },
    { id: 'tutoring', name: 'Tutoring', icon: 'school' },
    { id: 'beauty', name: 'Beauty', icon: 'cut' },
    { id: 'fitness', name: 'Fitness', icon: 'fitness' },
    { id: 'tech', name: 'Tech Support', icon: 'desktop' },
    { id: 'lawn', name: 'Lawn Care', icon: 'leaf' },
  ];

  useEffect(() => {
    loadServices();
  }, [selectedCategory]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/marketplace/services', {
        params: { category: selectedCategory }
      });
      setServices(response.data);
    } catch (error) {
      console.error('Error loading services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
  };

  const renderCategoryTab = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        selectedCategory === item.id && styles.categoryTabActive
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Ionicons
        name={item.icon}
        size={20}
        color={selectedCategory === item.id ? colors.white : colors.gray}
      />
      <Text style={[
        styles.categoryTabText,
        selectedCategory === item.id && styles.categoryTabTextActive
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderServiceItem = ({ item }) => (
    <ListingCard
      listing={item}
      onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Services"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        showCart={true}
        onCartPress={() => navigation.navigate('Cart')}
      />

      <View style={styles.content}>
        {/* Category Tabs */}
        <FlatList
          data={categories}
          renderItem={renderCategoryTab}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabs}
          style={styles.categoryTabsContainer}
        />

        {/* Services List */}
        <FlatList
          data={services}
          renderItem={renderServiceItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.servicesList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="construct-outline" size={64} color={colors.gray} />
              <Text style={styles.emptyStateTitle}>No services found</Text>
              <Text style={styles.emptyStateText}>
                {selectedCategory === 'all' 
                  ? 'Be the first to offer a service!'
                  : 'No services in this category yet.'
                }
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => navigation.navigate('CreateListing', { type: 'service' })}
              >
                <Text style={styles.emptyStateButtonText}>Offer Service</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateListing', { type: 'service' })}
      >
        <Ionicons name="add" size={24} color={colors.white} />
      </TouchableOpacity>
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
  categoryTabsContainer: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  categoryTabs: {
    paddingHorizontal: 16,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.lightGray,
  },
  categoryTabActive: {
    backgroundColor: colors.success,
  },
  categoryTabText: {
    fontSize: 14,
    color: colors.gray,
    marginLeft: 6,
    fontWeight: '500',
  },
  categoryTabTextActive: {
    color: colors.white,
  },
  servicesList: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 64,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyStateButton: {
    backgroundColor: colors.success,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
