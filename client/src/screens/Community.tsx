import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function Community({ navigation }: any) {
  const [selectedType, setSelectedType] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: communityPosts = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/community-posts'],
    queryFn: () => apiRequest('GET', '/api/community-posts'),
  });

  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      // For now, just optimistically update
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community-posts'] });
    },
  });

  const postTypes = [
    { id: 'all', name: 'All Posts', icon: 'grid' },
    { id: 'general', name: 'General', icon: 'chatbubble' },
    { id: 'event', name: 'Events', icon: 'calendar' },
    { id: 'announcement', name: 'News', icon: 'megaphone' },
    { id: 'question', name: 'Questions', icon: 'help-circle' },
  ];

  const filteredPosts = communityPosts.filter((post: any) => 
    selectedType === 'all' || post.postType === selectedType
  );

  const renderPostItem = ({ item }: { item: any }) => (
    <Card style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image
          source={{
            uri: item.user?.profileImageUrl || 'https://via.placeholder.com/40x40',
          }}
          style={styles.userAvatar}
        />
        <View style={styles.postInfo}>
          <Text style={styles.userName}>
            {item.user?.firstName} {item.user?.lastName}
          </Text>
          <Text style={styles.postTime}>
            {new Date(item.createdAt).toLocaleDateString()} • {item.location}
          </Text>
        </View>
        <Badge 
          text={item.postType} 
          variant={getPostTypeVariant(item.postType)} 
          size="small" 
        />
      </View>

      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContent}>{item.content}</Text>

      {item.images && item.images.length > 0 && (
        <View style={styles.postImages}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={item.images}
            keyExtractor={(image, index) => index.toString()}
            renderItem={({ item: image }) => (
              <Image source={{ uri: image }} style={styles.postImage} />
            )}
          />
        </View>
      )}

      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLikePost(item.id)}
        >
          <Ionicons name="heart-outline" size={20} color="#666" />
          <Text style={styles.actionText}>{item.likes || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleCommentPress(item)}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleSharePost(item)}
        >
          <Ionicons name="share-outline" size={20} color="#666" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const getPostTypeVariant = (type: string) => {
    switch (type) {
      case 'event':
        return 'warning';
      case 'announcement':
        return 'info';
      case 'question':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleLikePost = (postId: number) => {
    likePostMutation.mutate(postId);
  };

  const handleCommentPress = (post: any) => {
    // Navigate to post detail with comments
    console.log('Open comments for:', post.title);
  };

  const handleSharePost = (post: any) => {
    // Implement share functionality
    console.log('Share post:', post.title);
  };

  const handleCreatePost = () => {
    // Navigate to create post screen
    console.log('Create new post');
  };

  const handleTypePress = (typeId: string) => {
    setSelectedType(typeId);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreatePost}
        >
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Community Stats */}
      <Card style={styles.statsCard}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>1.2K</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{communityPosts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>45</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>
      </Card>

      {/* Post Type Filter */}
      <View style={styles.filterSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={postTypes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.typeButton,
                selectedType === item.id && styles.selectedTypeButton,
              ]}
              onPress={() => handleTypePress(item.id)}
            >
              <Ionicons
                name={item.icon as any}
                size={16}
                color={selectedType === item.id ? 'white' : '#666'}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  selectedType === item.id && styles.selectedTypeButtonText,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Posts Feed */}
      <FlatList
        data={filteredPosts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.postsContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No posts yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              Be the first to share something with your community
            </Text>
            <Button
              title="Create Post"
              onPress={handleCreatePost}
              style={styles.createPostButton}
            />
          </View>
        }
      />

      {/* Quick Post Input */}
      {user && (
        <View style={styles.quickPostContainer}>
          <Image
            source={{
              uri: user.profileImageUrl || 'https://via.placeholder.com/32x32',
            }}
            style={styles.quickPostAvatar}
          />
          <TouchableOpacity
            style={styles.quickPostInput}
            onPress={handleCreatePost}
          >
            <Text style={styles.quickPostPlaceholder}>
              What's happening in your neighborhood?
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
  createButton: {
    padding: 8,
  },
  statsCard: {
    margin: 16,
    backgroundColor: '#007AFF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterSection: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  selectedTypeButton: {
    backgroundColor: '#007AFF',
  },
  typeButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginLeft: 4,
  },
  selectedTypeButtonText: {
    color: 'white',
  },
  postsContainer: {
    padding: 16,
  },
  postCard: {
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  postTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  postImages: {
    marginBottom: 12,
  },
  postImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 8,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
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
  createPostButton: {
    marginTop: 10,
  },
  quickPostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  quickPostAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  quickPostInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  quickPostPlaceholder: {
    fontSize: 14,
    color: '#666',
  },
});
