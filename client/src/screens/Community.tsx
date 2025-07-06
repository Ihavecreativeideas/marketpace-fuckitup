import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CommunityPost {
  id: string;
  type: 'status' | 'poll' | 'iso' | 'hiring' | 'event';
  user: {
    name: string;
    avatar: string;
    location: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
}

export default function Community() {
  const [activeTab, setActiveTab] = useState('all');
  const [postText, setPostText] = useState('');

  // Mock community posts for demonstration
  const communityPosts: CommunityPost[] = [
    {
      id: '1',
      type: 'hiring',
      user: {
        name: 'Sarah\'s Bakery',
        avatar: 'https://via.placeholder.com/40x40',
        location: '0.3 miles away',
      },
      content: 'Hiring part-time baker! Flexible hours, experience preferred but will train the right person. Great way to earn extra income in our community.',
      timestamp: '2 hours ago',
      likes: 12,
      comments: 5,
    },
    {
      id: '2',
      type: 'iso',
      user: {
        name: 'Mike Johnson',
        avatar: 'https://via.placeholder.com/40x40',
        location: '0.8 miles away',
      },
      content: 'ISO: Looking for someone to help move a couch this weekend. Will pay $50 and provide pizza! Supporting local helpers over big companies.',
      timestamp: '4 hours ago',
      likes: 8,
      comments: 3,
    },
    {
      id: '3',
      type: 'event',
      user: {
        name: 'Community Center',
        avatar: 'https://via.placeholder.com/40x40',
        location: '1.2 miles away',
      },
      content: 'Local artisan market this Saturday! Come support our neighborhood creators, artists, and small businesses. Building our community together!',
      timestamp: '6 hours ago',
      likes: 25,
      comments: 8,
    },
  ];

  const tabs = [
    { id: 'all', label: 'All Posts', icon: 'grid' },
    { id: 'status', label: 'Updates', icon: 'chatbubble' },
    { id: 'iso', label: 'ISO', icon: 'search' },
    { id: 'hiring', label: 'Hiring', icon: 'briefcase' },
    { id: 'events', label: 'Events', icon: 'calendar' },
  ];

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'hiring': return '#10B981';
      case 'iso': return '#3B82F6';
      case 'event': return '#F59E0B';
      case 'poll': return '#8B5CF6';
      default: return '#6B46C1';
    }
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'hiring': return 'HIRING NOW';
      case 'iso': return 'IN SEARCH OF';
      case 'event': return 'LOCAL EVENT';
      case 'poll': return 'COMMUNITY POLL';
      default: return 'UPDATE';
    }
  };

  const renderPost = ({ item }: { item: CommunityPost }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.user.name}</Text>
          <Text style={styles.userLocation}>{item.user.location}</Text>
        </View>
        <View style={[styles.typeTag, { backgroundColor: getPostTypeColor(item.type) }]}>
          <Text style={styles.typeTagText}>{getPostTypeLabel(item.type)}</Text>
        </View>
      </View>
      
      <Text style={styles.postContent}>{item.content}</Text>
      
      <View style={styles.postFooter}>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="heart-outline" size={16} color="#8E8E93" />
            <Text style={styles.actionText}>{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={16} color="#8E8E93" />
            <Text style={styles.actionText}>{item.comments}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
        <Text style={styles.headerSubtitle}>Building stronger neighborhoods together</Text>
      </View>

      {/* Tab Navigation */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.tabContainer}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={tab.icon as any}
              size={16}
              color={activeTab === tab.id ? '#6B46C1' : '#8E8E93'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Create Post */}
      <View style={styles.createPostContainer}>
        <TextInput
          style={styles.createPostInput}
          placeholder="Share something with your community..."
          value={postText}
          onChangeText={setPostText}
          multiline
        />
        <TouchableOpacity style={styles.postButton}>
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Community Posts Feed */}
      <FlatList
        data={communityPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  tabContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  activeTab: {
    backgroundColor: '#E0E7FF',
  },
  tabText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 6,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#6B46C1',
  },
  createPostContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  createPostInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 80,
    fontSize: 16,
  },
  postButton: {
    backgroundColor: '#6B46C1',
    borderRadius: 20,
    padding: 10,
  },
  feedContainer: {
    paddingBottom: 100,
  },
  postCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  userLocation: {
    fontSize: 12,
    color: '#8E8E93',
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
  },
  postContent: {
    fontSize: 16,
    lineHeight: 22,
    color: '#1C1C1E',
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#8E8E93',
  },
  postActions: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  actionText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
});