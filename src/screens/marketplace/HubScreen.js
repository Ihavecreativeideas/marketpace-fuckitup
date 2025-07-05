import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/common/Header';
import { colors } from '../../utils/colors';
import { api } from '../../services/api';

export default function HubScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Events', icon: 'calendar' },
    { id: 'concerts', name: 'Concerts', icon: 'musical-notes' },
    { id: 'sports', name: 'Sports', icon: 'football' },
    { id: 'food', name: 'Food & Drink', icon: 'restaurant' },
    { id: 'art', name: 'Art & Culture', icon: 'brush' },
    { id: 'business', name: 'Business', icon: 'briefcase' },
    { id: 'community', name: 'Community', icon: 'people' },
    { id: 'nightlife', name: 'Nightlife', icon: 'wine' },
  ];

  useEffect(() => {
    loadEvents();
  }, [selectedCategory]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/marketplace/events', {
        params: { category: selectedCategory }
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
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

  const renderEventItem = ({ item }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
    >
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/300x200/FFB800/FFFFFF?text=Event' }}
        style={styles.eventImage}
      />
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventPrice}>${item.price}</Text>
        </View>
        <Text style={styles.eventDate}>{item.date}</Text>
        <Text style={styles.eventLocation}>{item.location}</Text>
        <View style={styles.eventFooter}>
          <View style={styles.eventType}>
            <Ionicons name="pricetag" size={14} color={colors.warning} />
            <Text style={styles.eventTypeText}>{item.type}</Text>
          </View>
          <View style={styles.eventAttendees}>
            <Ionicons name="people" size={14} color={colors.gray} />
            <Text style={styles.eventAttendeesText}>{item.attendees} going</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="The Hub"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        showCart={true}
        onCartPress={() => navigation.navigate('Cart')}
      />

      <View style={styles.content}>
        {/* Featured Section */}
        <View style={styles.featuredSection}>
          <Text style={styles.featuredTitle}>Entertainment & Events</Text>
          <Text style={styles.featuredSubtitle}>
            Discover amazing events and entertainment in your area
          </Text>
        </View>

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

        {/* Events List */}
        <FlatList
          data={events}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.eventsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color={colors.gray} />
              <Text style={styles.emptyStateTitle}>No events found</Text>
              <Text style={styles.emptyStateText}>
                {selectedCategory === 'all' 
                  ? 'Be the first to create an event!'
                  : 'No events in this category yet.'
                }
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => navigation.navigate('CreateListing', { type: 'event' })}
              >
                <Text style={styles.emptyStateButtonText}>Create Event</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateListing', { type: 'event' })}
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
  featuredSection: {
    backgroundColor: colors.warning,
    padding: 20,
    alignItems: 'center',
  },
  featuredTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  featuredSubtitle: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
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
    backgroundColor: colors.warning,
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
  eventsList: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  eventImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  eventPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.warning,
  },
  eventDate: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 4,
    fontWeight: '500',
  },
  eventLocation: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 12,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTypeText: {
    fontSize: 12,
    color: colors.warning,
    marginLeft: 4,
    fontWeight: '500',
  },
  eventAttendees: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventAttendeesText: {
    fontSize: 12,
    color: colors.gray,
    marginLeft: 4,
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
    backgroundColor: colors.warning,
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
    backgroundColor: colors.warning,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
