import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const { width } = Dimensions.get('window');

export default function TheHub({ navigation }: any) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: entertainmentListings = [] } = useQuery({
    queryKey: ['/api/listings', 'entertainment'],
    queryFn: () => apiRequest('GET', '/api/listings?categoryType=entertainment'),
  });

  const categories = [
    { id: 'all', name: 'All', icon: 'grid' },
    { id: 'events', name: 'Events', icon: 'calendar' },
    { id: 'live', name: 'Live Streams', icon: 'videocam' },
    { id: 'music', name: 'Music', icon: 'musical-notes' },
    { id: 'sports', name: 'Sports', icon: 'basketball' },
    { id: 'gaming', name: 'Gaming', icon: 'game-controller' },
  ];

  const featuredEvents = [
    {
      id: 1,
      title: 'Local Music Festival',
      image: 'https://pixabay.com/get/g84a89fec22de0daf81955c031882ae29bca992142ad138a6ba011aff644ef2fd7969bc98ffcd0995c1ff7e74b973e1ca9525344dd73c903b20453b4e8d6502c9_1280.jpg',
      date: '2025-01-15',
      price: 25,
      location: 'Downtown Park',
      attendees: 124,
    },
    {
      id: 2,
      title: 'Comedy Night',
      image: 'https://pixabay.com/get/g70ccd3c6a2c2847e7217a1a45cad0aac8ba02c95f48e25fc3e081e1672d07e5f8d908af6f57d81963964110c8d04b05ec0326ca1833a53c5179b5422cd40b024_1280.jpg',
      date: '2025-01-20',
      price: 15,
      location: 'Comedy Club',
      attendees: 89,
    },
  ];

  const liveStreams = [
    {
      id: 1,
      title: 'Cooking with Chef Maria',
      streamer: 'Chef Maria',
      viewers: 234,
      thumbnail: 'https://pixabay.com/get/gbd994e803f4684fa05a6881868ea91703b9940cd8ca00852f54d3838ab102feacf2b8967eabb1563ad0263064e38fe768a814f6caf4aa057ffafba949350121b_1280.jpg',
      category: 'Cooking',
    },
    {
      id: 2,
      title: 'Local News Update',
      streamer: 'NewsChannel 5',
      viewers: 456,
      thumbnail: 'https://pixabay.com/get/g92949af28c927c184bc66267f05116951598601cdf94e876620a15ef492ef18a7f640b28ebb597aa640fd9dd47f813a84136d75b9292023d239673e7c64232c9_1280.jpg',
      category: 'News',
    },
  ];

  const renderFeaturedEvent = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.featuredCard}>
      <Image source={{ uri: item.image }} style={styles.featuredImage} />
      <View style={styles.featuredOverlay}>
        <Text style={styles.featuredTitle}>{item.title}</Text>
        <Text style={styles.featuredDate}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
        <View style={styles.featuredFooter}>
          <Text style={styles.featuredPrice}>${item.price}</Text>
          <Text style={styles.featuredAttendees}>
            {item.attendees} attending
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderLiveStream = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.streamCard}>
      <View style={styles.streamThumbnail}>
        <Image source={{ uri: item.thumbnail }} style={styles.streamImage} />
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <View style={styles.viewerCount}>
          <Ionicons name="eye" size={12} color="white" />
          <Text style={styles.viewerText}>{item.viewers}</Text>
        </View>
      </View>
      <View style={styles.streamInfo}>
        <Text style={styles.streamTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.streamAuthor}>{item.streamer}</Text>
        <Badge text={item.category} variant="info" size="small" />
      </View>
    </TouchableOpacity>
  );

  const renderEntertainmentItem = ({ item }: { item: any }) => (
    <Card style={styles.entertainmentCard}>
      <Image
        source={{
          uri: item.images?.[0] || 'https://via.placeholder.com/300x200',
        }}
        style={styles.entertainmentImage}
      />
      <View style={styles.entertainmentContent}>
        <Text style={styles.entertainmentTitle}>{item.title}</Text>
        <Text style={styles.entertainmentDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.entertainmentFooter}>
          <Text style={styles.entertainmentPrice}>${item.price}</Text>
          <Button
            title="Join"
            onPress={() => handleJoinEvent(item)}
            size="small"
          />
        </View>
      </View>
    </Card>
  );

  const handleJoinEvent = (event: any) => {
    console.log('Join event:', event.title);
  };

  const handleStartStream = () => {
    console.log('Start live stream');
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>The Hub</Text>
        <Text style={styles.headerSubtitle}>Entertainment & Events</Text>
      </View>

      {/* Live Stream Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Live Now</Text>
          <Button
            title="Go Live"
            onPress={handleStartStream}
            size="small"
            variant="outline"
          />
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={liveStreams}
          renderItem={renderLiveStream}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>

      {/* Featured Events */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Events</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={featuredEvents}
          renderItem={renderFeaturedEvent}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item.id && styles.selectedCategoryButton,
              ]}
              onPress={() => handleCategoryPress(item.id)}
            >
              <Ionicons
                name={item.icon as any}
                size={20}
                color={selectedCategory === item.id ? 'white' : '#666'}
              />
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

      {/* Entertainment Listings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Entertainment</Text>
        {entertainmentListings.length > 0 ? (
          <FlatList
            data={entertainmentListings}
            renderItem={renderEntertainmentItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="videocam-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No events available</Text>
            <Text style={styles.emptyStateSubtitle}>
              Check back later for exciting entertainment options
            </Text>
          </View>
        )}
      </View>

      {/* Create Event CTA */}
      <Card style={styles.ctaCard}>
        <View style={styles.ctaContent}>
          <Ionicons name="add-circle" size={48} color="#007AFF" />
          <Text style={styles.ctaTitle}>Host Your Event</Text>
          <Text style={styles.ctaSubtitle}>
            Share your talent with the community
          </Text>
          <Button
            title="Create Event"
            onPress={() => navigation.navigate('CreateListing')}
            style={styles.ctaButton}
          />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
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
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  streamCard: {
    width: 150,
    marginRight: 12,
  },
  streamThumbnail: {
    position: 'relative',
    marginBottom: 8,
  },
  streamImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
  },
  liveIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    marginRight: 4,
  },
  liveText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  viewerCount: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  viewerText: {
    color: 'white',
    fontSize: 10,
    marginLeft: 2,
  },
  streamInfo: {
    flex: 1,
  },
  streamTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  streamAuthor: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  featuredCard: {
    width: width - 64,
    height: 200,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
    padding: 16,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  featuredDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  featuredAttendees: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  categoriesSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginLeft: 6,
  },
  selectedCategoryButtonText: {
    color: 'white',
  },
  entertainmentCard: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  entertainmentImage: {
    width: '100%',
    height: 160,
  },
  entertainmentContent: {
    padding: 16,
  },
  entertainmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  entertainmentDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  entertainmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entertainmentPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
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
  },
  ctaCard: {
    margin: 16,
    backgroundColor: '#f0f8ff',
  },
  ctaContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaButton: {
    minWidth: 150,
  },
});
