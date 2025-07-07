import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Image,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Dark Purple Futuristic Theme Colors
const colors = {
  background: '#0d0221',
  backgroundSecondary: '#1a0633', 
  backgroundTertiary: '#2d1b4e',
  primary: '#00FFFF',
  secondary: '#8A2BE2',
  accent: '#00BFFF',
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.8)',
  card: 'rgba(255, 255, 255, 0.04)',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
};

// Floating Particles Component
const FloatingParticles = () => {
  const { width, height } = Dimensions.get('window');
  const [particles] = useState(() => 
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      animValue: new Animated.Value(0),
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.6 + 0.2,
    }))
  );

  useEffect(() => {
    particles.forEach((particle, index) => {
      const animate = () => {
        Animated.loop(
          Animated.timing(particle.animValue, {
            toValue: 1,
            duration: 8000 + (index * 200),
            useNativeDriver: true,
          })
        ).start();
      };
      setTimeout(animate, index * 100);
    });
  }, [particles]);

  return (
    <View style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      pointerEvents: 'none',
      zIndex: 1
    }}>
      {particles.map((particle) => (
        <Animated.View
          key={particle.id}
          style={{
            position: 'absolute',
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: Math.random() > 0.5 ? colors.primary : colors.secondary,
            borderRadius: particle.size / 2,
            opacity: particle.opacity,
            transform: [{
              translateY: particle.animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -height - 100],
              }),
            }],
          }}
        />
      ))}
    </View>
  );
};

const Community = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState([
    {
      id: '1',
      type: 'status',
      user: {
        name: 'Sarah Johnson',
        location: 'Downtown Seattle',
        avatar: 'https://i.pravatar.cc/150?img=1'
      },
      content: 'Just opened my small bakery! Come try our fresh sourdough bread and support local business! 🍞',
      likes: 12,
      isLiked: false,
      comments: [
        { id: '1', user: 'Mike Chen', content: 'Congratulations! Can\'t wait to try it!', timestamp: '5m ago' }
      ],
      timestamp: '2 hours ago',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    {
      id: '2',
      type: 'poll',
      user: {
        name: 'Community Events',
        location: 'Seattle Parks',
        avatar: 'https://i.pravatar.cc/150?img=2'
      },
      content: 'What kind of community event would you like to see next month?',
      likes: 8,
      isLiked: true,
      comments: [],
      timestamp: '4 hours ago',
      avatar: 'https://i.pravatar.cc/150?img=2',
      poll: {
        question: 'Vote for next month\'s event:',
        options: [
          { id: 'a', text: 'Outdoor Movie Night', votes: 15 },
          { id: 'b', text: 'Local Food Festival', votes: 23 },
          { id: 'c', text: 'Community Cleanup Day', votes: 8 },
          { id: 'd', text: 'Arts & Crafts Fair', votes: 12 }
        ]
      }
    },
    {
      id: '3',
      type: 'hiring',
      user: {
        name: 'Green Garden Cafe',
        location: 'Capitol Hill',
        avatar: 'https://i.pravatar.cc/150?img=3'
      },
      content: 'We\'re hiring! Looking for a friendly barista to join our team. Part-time, flexible hours, great tips!',
      likes: 6,
      isLiked: false,
      comments: [],
      timestamp: '6 hours ago',
      avatar: 'https://i.pravatar.cc/150?img=3',
      actionable: {
        type: 'hire',
        buttonText: 'Apply Now',
        price: '$15-18/hr + tips'
      }
    }
  ]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newComment, setNewComment] = useState('');

  const tabs = [
    { id: 'all', label: 'All Posts', icon: 'grid' },
    { id: 'status', label: 'Updates', icon: 'chatbubble' },
    { id: 'iso', label: 'ISO', icon: 'search' },
    { id: 'hiring', label: 'Hiring', icon: 'briefcase' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'poll', label: 'Polls', icon: 'stats-chart' }
  ];

  const handleLike = (postId) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked: !post.isLiked, 
              likes: post.isLiked ? post.likes - 1 : post.likes + 1 
            }
          : post
      )
    );
  };

  const handleComment = (postId) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setSelectedPost(post);
      setShowComments(true);
    }
  };

  const handleVote = (postId, optionId) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId && post.poll
          ? {
              ...post,
              poll: {
                ...post.poll,
                options: post.poll.options.map(option =>
                  option.id === optionId
                    ? { ...option, votes: option.votes + 1 }
                    : option
                )
              }
            }
          : post
      )
    );
  };

  const getPostTypeColor = (type) => {
    switch (type) {
      case 'status': return '#10B981';
      case 'poll': return '#8B5CF6';
      case 'iso': return '#F59E0B';
      case 'hiring': return '#EF4444';
      case 'events': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getPostTypeLabel = (type) => {
    switch (type) {
      case 'status': return 'UPDATE';
      case 'poll': return 'POLL';
      case 'iso': return 'ISO';
      case 'hiring': return 'HIRING';
      case 'events': return 'EVENT';
      default: return 'POST';
    }
  };

  const addComment = () => {
    if (newComment.trim() && selectedPost) {
      const updatedPost = {
        ...selectedPost,
        comments: [
          ...selectedPost.comments,
          {
            id: Date.now().toString(),
            user: 'You',
            content: newComment.trim(),
            timestamp: 'just now'
          }
        ]
      };
      
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === selectedPost.id ? updatedPost : post
        )
      );
      
      setSelectedPost(updatedPost);
      setNewComment('');
    }
  };

  const handleAction = (post) => {
    if (post.actionable) {
      switch (post.actionable.type) {
        case 'hire':
          alert(`Applying for position at ${post.user.name}`);
          break;
        default:
          alert('Action button pressed!');
      }
    }
  };

  const renderPost = ({ item }) => (
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

      {item.poll && (
        <View style={styles.pollContainer}>
          <Text style={styles.pollQuestion}>{item.poll.question}</Text>
          {item.poll.options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.pollOption}
              onPress={() => handleVote(item.id, option.id)}
            >
              <View style={styles.pollOptionContent}>
                <Text style={styles.pollOptionText}>{option.text}</Text>
                <Text style={styles.pollVotes}>{option.votes} votes</Text>
              </View>
              <View style={[styles.pollBar, { width: `${(option.votes / 30) * 100}%` }]} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {item.actionable && (
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: getPostTypeColor(item.type) }]}
          onPress={() => handleAction(item)}
        >
          <Text style={styles.actionButtonText}>{item.actionable.buttonText}</Text>
          <Text style={styles.actionButtonPrice}>{item.actionable.price}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => handleLike(item.id)}
        >
          <Ionicons 
            name={item.isLiked ? 'heart' : 'heart-outline'} 
            size={20} 
            color={item.isLiked ? '#EF4444' : '#6B7280'} 
          />
          <Text style={[styles.actionText, item.isLiked && { color: '#EF4444' }]}>
            {item.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => handleComment(item.id)}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#6B7280" />
          <Text style={styles.actionText}>{item.comments.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="share-outline" size={20} color="#6B7280" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.timestamp}>{item.timestamp}</Text>
    </View>
  );

  const filteredPosts = activeTab === 'all' 
    ? posts 
    : posts.filter(post => post.type === activeTab);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FloatingParticles />
      {/* Header */}
      <LinearGradient
        colors={[colors.backgroundSecondary, colors.backgroundTertiary, colors.background]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Community Feed</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setShowCreatePost(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

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
              activeTab === tab.id && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons 
              name={tab.icon} 
              size={16} 
              color={activeTab === tab.id ? '#6B46C1' : '#9CA3AF'} 
            />
            <Text style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Posts Feed */}
      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        style={styles.postsContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Comments Modal */}
      <Modal
        visible={showComments}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.commentsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments</Text>
              <TouchableOpacity onPress={() => setShowComments(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.commentsContainer}>
              {selectedPost?.comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <Text style={styles.commentUser}>{comment.user}</Text>
                  <Text style={styles.commentText}>{comment.content}</Text>
                  <Text style={styles.commentTime}>{comment.timestamp}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.addCommentContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <TouchableOpacity
                style={styles.sendCommentButton}
                onPress={addComment}
              >
                <Ionicons name="send" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Facebook Share Button */}
      <TouchableOpacity 
        style={{
          position: 'absolute',
          bottom: 100,
          right: 20,
          backgroundColor: '#1877F2',
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 25,
          elevation: 5,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          shadowColor: '#1877F2',
          zIndex: 1000,
        }}
        onPress={() => {
          const shareUrl = encodeURIComponent('https://MarketPace.shop');
          const shareText = encodeURIComponent('Join the community-first marketplace revolution! MarketPace is building stronger neighborhoods through local commerce. #MarketPace #CommunityFirst #LocalCommerce');
          const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`;
          
          if (typeof window !== 'undefined') {
            window.open(facebookUrl, '_blank');
          }
        }}
      >
        <Text style={{
          color: '#FFFFFF',
          fontWeight: '600',
          fontSize: 14,
        }}>📘 Share to Facebook</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  createButton: {
    backgroundColor: '#6B46C1',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  activeTab: {
    backgroundColor: '#E0E7FF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#6B46C1',
  },
  postsContainer: {
    flex: 1,
    paddingTop: 16,
  },
  postCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
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
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  userLocation: {
    fontSize: 14,
    color: '#8E8E93',
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  postContent: {
    fontSize: 16,
    lineHeight: 22,
    color: '#1D1D1F',
    marginBottom: 16,
  },
  pollContainer: {
    marginBottom: 16,
  },
  pollQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  pollOption: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  pollOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  pollOptionText: {
    fontSize: 14,
    color: '#1D1D1F',
  },
  pollVotes: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  pollBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#E0E7FF',
    borderRadius: 8,
  },
  actionButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonPrice: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  timestamp: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  commentsModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  commentsContainer: {
    flex: 1,
    padding: 20,
  },
  commentItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  commentUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#1D1D1F',
    lineHeight: 20,
    marginBottom: 4,
  },
  commentTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  addCommentContainer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    alignItems: 'flex-end',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 80,
    fontSize: 16,
  },
  sendCommentButton: {
    backgroundColor: '#6B46C1',
    borderRadius: 20,
    padding: 10,
  },
});

export default Community;