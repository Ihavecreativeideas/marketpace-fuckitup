import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const { width } = Dimensions.get('window');

export default function Home({ navigation }: any) {
  const { user } = useAuth();
  
  const { data: recentListings = [] } = useQuery({
    queryKey: ['/api/listings', { limit: 6 }],
    queryFn: () => apiRequest('GET', '/api/listings?limit=6'),
  });

  const { data: communityPosts = [] } = useQuery({
    queryKey: ['/api/community-posts', { limit: 3 }],
    queryFn: () => apiRequest('GET', '/api/community-posts?limit=3'),
  });

  const categories = [
    { id: 'shops', name: 'Shops', icon: 'storefront', color: '#FF6B6B' },
    { id: 'services', name: 'Services', icon: 'construct', color: '#4ECDC4' },
    { id: 'hub', name: 'The Hub', icon: 'videocam', color: '#45B7D1' },
    { id: 'community', name: 'Community', icon: 'people', color: '#96CEB4' },
  ];

  const handleCategoryPress = (categoryId: string) => {
    switch (categoryId) {
      case 'shops':
        navigation.navigate('Marketplace');
        break;
      case 'services':
        navigation.navigate('Services');
        break;
      case 'hub':
        navigation.navigate('TheHub');
        break;
      case 'community':
        navigation.navigate('Community');
        break;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hello, {user?.firstName || 'User'}!
          </Text>
          <Text style={styles.subtitle}>Welcome to MarketPace</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Image
            source={{
              uri: user?.profileImageUrl || 'https://via.placeholder.com/40x40',
            }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <Card style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Marketplace', { screen: 'CreateListing' })}
          >
            <Ionicons name="add-circle" size={24} color="#007AFF" />
            <Text style={styles.actionText}>Sell Item</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Marketplace', { screen: 'Cart' })}
          >
            <Ionicons name="cart" size={24} color="#007AFF" />
            <Text style={styles.actionText}>My Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Profile', { screen: 'DriverApplication' })}
          >
            <Ionicons name="car" size={24} color="#007AFF" />
            <Text style={styles.actionText}>Drive</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Explore Categories</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryCard, { backgroundColor: category.color }]}
              onPress={() => handleCategoryPress(category.id)}
            >
              <Ionicons name={category.icon as any} size={32} color="white" />
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Listings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Listings</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Marketplace')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {recentListings.map((listing: any) => (
            <TouchableOpacity key={listing.id} style={styles.listingCard}>
              <Image
                source={{
                  uri: listing.images?.[0] || 'https://via.placeholder.com/150x100',
                }}
                style={styles.listingImage}
              />
              <View style={styles.listingInfo}>
                <Text style={styles.listingTitle} numberOfLines={2}>
                  {listing.title}
                </Text>
                <Text style={styles.listingPrice}>${listing.price}</Text>
                <Badge 
                  text={listing.condition || 'New'} 
                  variant="info" 
                  size="small" 
                />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Community Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Community Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Community')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {communityPosts.map((post: any) => (
          <Card key={post.id} style={styles.communityPost}>
            <View style={styles.postHeader}>
              <Image
                source={{
                  uri: post.user?.profileImageUrl || 'https://via.placeholder.com/30x30',
                }}
                style={styles.postAvatar}
              />
              <View style={styles.postInfo}>
                <Text style={styles.postAuthor}>
                  {post.user?.firstName} {post.user?.lastName}
                </Text>
                <Text style={styles.postTime}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postContent} numberOfLines={2}>
              {post.content}
            </Text>
          </Card>
        ))}
      </View>

      {/* Pro Upgrade Banner */}
      {!user?.isPro && (
        <Card style={styles.proSection}>
          <View style={styles.proBanner}>
            <Ionicons name="star" size={32} color="#FFD700" />
            <View style={styles.proContent}>
              <Text style={styles.proTitle}>Upgrade to MarketPace Pro</Text>
              <Text style={styles.proSubtitle}>
                Unlock premium features and unlimited listings
              </Text>
            </View>
            <Button
              title="Upgrade"
              onPress={() => navigation.navigate('Profile', { screen: 'Subscribe' })}
              size="small"
            />
          </View>
        </Card>
      )}
    </ScrollView>
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
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'white',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  quickActions: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
  },
  actionText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAll: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 48) / 2,
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 8,
  },
  listingCard: {
    width: 150,
    marginRight: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
  },
  listingImage: {
    width: '100%',
    height: 100,
  },
  listingInfo: {
    padding: 8,
  },
  listingTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  listingPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  communityPost: {
    marginBottom: 8,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  postAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  postInfo: {
    flex: 1,
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  postTime: {
    fontSize: 12,
    color: '#666',
  },
  postTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  postContent: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  proSection: {
    margin: 16,
    backgroundColor: '#f0f8ff',
  },
  proBanner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  proContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  proTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  proSubtitle: {
    fontSize: 12,
    color: '#666',
  },
});
