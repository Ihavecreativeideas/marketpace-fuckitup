import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/common/Header';
import { colors } from '../../utils/colors';
import { api } from '../../services/api';

export default function CommunityScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const { user } = useAuth();

  const categories = [
    { id: 'all', name: 'All Posts', icon: 'home' },
    { id: 'general', name: 'General', icon: 'chatbubble' },
    { id: 'marketplace', name: 'Marketplace', icon: 'storefront' },
    { id: 'events', name: 'Events', icon: 'calendar' },
    { id: 'recommendations', name: 'Recommendations', icon: 'star' },
    { id: 'help', name: 'Help', icon: 'help-circle' },
    { id: 'announcements', name: 'Announcements', icon: 'megaphone' },
  ];

  useEffect(() => {
    loadCommunityPosts();
  }, [selectedCategory]);

  const loadCommunityPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/community/posts', {
        params: { category: selectedCategory }
      });
      setPosts(response.data);
    } catch (error) {
      console.error('Error loading community posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCommunityPosts();
    setRefreshing(false);
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) {
      Alert.alert('Error', 'Please enter a post message');
      return;
    }

    if (!user) {
      Alert.alert('Login Required', 'Please log in to create a post');
      return;
    }

    try {
      await api.post('/community/posts', {
        content: newPost,
        category: selectedCategory === 'all' ? 'general' : selectedCategory,
      });

      setNewPost('');
      setShowCreatePost(false);
      loadCommunityPosts();
      Alert.alert('Success', 'Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post');
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await api.post(`/community/posts/${postId}/like`);
      loadCommunityPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleReportPost = async (postId) => {
    Alert.alert(
      'Report Post',
      'Why are you reporting this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Inappropriate', onPress: () => reportPost(postId, 'inappropriate') },
        { text: 'Spam', onPress: () => reportPost(postId, 'spam') },
        { text: 'Other', onPress: () => reportPost(postId, 'other') },
      ]
    );
  };

  const reportPost = async (postId, reason) => {
    try {
      await api.post(`/community/posts/${postId}/report`, { reason });
      Alert.alert('Thank you', 'Your report has been submitted');
    } catch (error) {
      console.error('Error reporting post:', error);
      Alert.alert('Error', 'Failed to report post');
    }
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
        size={16}
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

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image
          source={{ uri: item.author.profileImage || 'https://via.placeholder.com/40' }}
          style={styles.authorImage}
        />
        <View style={styles.postHeaderText}>
          <Text style={styles.authorName}>{item.author.name}</Text>
          <Text style={styles.postTime}>{item.createdAt}</Text>
        </View>
        <TouchableOpacity onPress={() => handleReportPost(item.id)}>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.gray} />
        </TouchableOpacity>
      </View>

      <Text style={styles.postContent}>{item.content}</Text>

      {item.images && item.images.length > 0 && (
        <ScrollView horizontal style={styles.postImages}>
          {item.images.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.postImage} />
          ))}
        </ScrollView>
      )}

      <View style={styles.postFooter}>
        <TouchableOpacity
          style={styles.postAction}
          onPress={() => handleLikePost(item.id)}
        >
          <Ionicons
            name={item.isLiked ? 'heart' : 'heart-outline'}
            size={20}
            color={item.isLiked ? colors.error : colors.gray}
          />
          <Text style={styles.postActionText}>{item.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.postAction}
          onPress={() => navigation.navigate('PostComments', { postId: item.id })}
        >
          <Ionicons name="chatbubble-outline" size={20} color={colors.gray} />
          <Text style={styles.postActionText}>{item.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.postAction}
          onPress={() => Alert.alert('Share', 'Share functionality coming soon')}
        >
          <Ionicons name="share-outline" size={20} color={colors.gray} />
          <Text style={styles.postActionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Community"
        rightComponent={
          <TouchableOpacity
            onPress={() => setShowCreatePost(!showCreatePost)}
            style={styles.createPostButton}
          >
            <Ionicons name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        }
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

        {/* Create Post */}
        {showCreatePost && (
          <View style={styles.createPostContainer}>
            <TextInput
              style={styles.createPostInput}
              value={newPost}
              onChangeText={setNewPost}
              placeholder="What's on your mind?"
              multiline
              numberOfLines={3}
            />
            <View style={styles.createPostActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowCreatePost(false);
                  setNewPost('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.postButton}
                onPress={handleCreatePost}
              >
                <Text style={styles.postButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Posts List */}
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.postsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color={colors.gray} />
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptySubtitle}>
                {selectedCategory === 'all' 
                  ? 'Be the first to start a conversation!'
                  : `No posts in ${categories.find(c => c.id === selectedCategory)?.name} category`
                }
              </Text>
              {user && (
                <TouchableOpacity
                  style={styles.createFirstPostButton}
                  onPress={() => setShowCreatePost(true)}
                >
                  <Text style={styles.createFirstPostButtonText}>Create First Post</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      </View>
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
  createPostButton: {
    backgroundColor: colors.primary + '20',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: colors.lightGray,
  },
  categoryTabActive: {
    backgroundColor: colors.primary,
  },
  categoryTabText: {
    fontSize: 12,
    color: colors.gray,
    marginLeft: 4,
    fontWeight: '500',
  },
  categoryTabTextActive: {
    color: colors.white,
  },
  createPostContainer: {
    backgroundColor: colors.white,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  createPostInput: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  createPostActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  cancelButtonText: {
    color: colors.gray,
    fontSize: 14,
  },
  postButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  postButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  postsList: {
    paddingVertical: 8,
  },
  postCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postHeaderText: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  postTime: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  postContent: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  postImages: {
    marginBottom: 12,
  },
  postImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginRight: 8,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postActionText: {
    fontSize: 12,
    color: colors.gray,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  createFirstPostButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstPostButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
