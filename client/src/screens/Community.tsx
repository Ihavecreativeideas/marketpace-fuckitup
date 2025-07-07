import * as React from 'react';
import { useState } from 'react';
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
  type: 'status' | 'poll' | 'iso' | 'hiring' | 'event' | 'discussion';
  user: {
    name: string;
    avatar: string;
    location: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  isLiked: boolean;
  poll?: {
    question: string;
    options: { id: string; text: string; votes: number }[];
    totalVotes: number;
  };
  actionable?: {
    type: 'book' | 'deliver' | 'hire' | 'join';
    label: string;
    price?: string;
  };
}

interface Comment {
  id: string;
  user: string;
  content: string;
  timestamp: string;
  avatar: string;
}

function Community() {
  const [activeTab, setActiveTab] = useState('all');
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [createPostType, setCreatePostType] = useState<'status' | 'poll' | 'discussion'>('status');
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  // Initialize posts with interactive features
  React.useEffect(() => {
    const initialPosts: CommunityPost[] = [
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
        comments: [
          { id: '1', user: 'Emma Wilson', content: 'This sounds perfect! I have some baking experience.', timestamp: '1 hour ago', avatar: 'https://via.placeholder.com/30x30' },
          { id: '2', user: 'David Chen', content: 'What are the hours like?', timestamp: '45 minutes ago', avatar: 'https://via.placeholder.com/30x30' }
        ],
        isLiked: false,
        actionable: { type: 'hire', label: 'Apply Now', price: '$15/hour' }
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
        comments: [
          { id: '3', user: 'Alex Rivera', content: 'I can help! What time works best?', timestamp: '2 hours ago', avatar: 'https://via.placeholder.com/30x30' }
        ],
        isLiked: true,
        actionable: { type: 'book', label: 'Book Now', price: '$50' }
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
        comments: [
          { id: '4', user: 'Lisa Martinez', content: 'Can\'t wait! Will there be food vendors?', timestamp: '3 hours ago', avatar: 'https://via.placeholder.com/30x30' },
          { id: '5', user: 'John Smith', content: 'Great initiative for the community!', timestamp: '2 hours ago', avatar: 'https://via.placeholder.com/30x30' }
        ],
        isLiked: false,
        actionable: { type: 'join', label: 'Join Event', price: 'Free' }
      },
      {
        id: '4',
        type: 'poll',
        user: {
          name: 'Maria Garcia',
          avatar: 'https://via.placeholder.com/40x40',
          location: '0.5 miles away',
        },
        content: 'What type of community events would you like to see more of?',
        timestamp: '1 day ago',
        likes: 18,
        comments: [
          { id: '6', user: 'Tom Wilson', content: 'I voted for outdoor activities!', timestamp: '8 hours ago', avatar: 'https://via.placeholder.com/30x30' }
        ],
        isLiked: true,
        poll: {
          question: 'What type of community events would you like to see more of?',
          options: [
            { id: 'a', text: 'Outdoor activities', votes: 15 },
            { id: 'b', text: 'Workshops & classes', votes: 12 },
            { id: 'c', text: 'Food festivals', votes: 20 },
            { id: 'd', text: 'Music & arts', votes: 8 }
          ],
          totalVotes: 55
        }
      },
      {
        id: '5',
        type: 'discussion',
        user: {
          name: 'Robert Lee',
          avatar: 'https://via.placeholder.com/40x40',
          location: '1.0 miles away',
        },
        content: 'Discussion: What are your thoughts on adding bike lanes to Main Street? Would love to hear community input before the city council meeting.',
        timestamp: '12 hours ago',
        likes: 31,
        comments: [
          { id: '7', user: 'Sarah Johnson', content: 'I think it\'s a great idea! Would make cycling much safer.', timestamp: '10 hours ago', avatar: 'https://via.placeholder.com/30x30' },
          { id: '8', user: 'Mike Brown', content: 'Concerned about parking spaces though...', timestamp: '8 hours ago', avatar: 'https://via.placeholder.com/30x30' },
          { id: '9', user: 'Jenny White', content: 'Maybe we could do a trial period first?', timestamp: '6 hours ago', avatar: 'https://via.placeholder.com/30x30' }
        ],
        isLiked: false
      }
    ];
    setPosts(initialPosts);
  }, []);

  const tabs = [
    { id: 'all', label: 'All Posts', icon: 'grid' },
    { id: 'status', label: 'Updates', icon: 'chatbubble' },
    { id: 'iso', label: 'ISO', icon: 'search' },
    { id: 'hiring', label: 'Hiring', icon: 'briefcase' },
    { id: 'events', label: 'Events', icon: 'calendar' },
    { id: 'poll', label: 'Polls', icon: 'stats-chart' },
    { id: 'discussion', label: 'Discussions', icon: 'chatbubbles' },
  ];

  // Interactive functions
  const handleLike = (postId: string) => {
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

  const handleComment = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setSelectedPost(post);
      setShowComments(true);
    }
  };

  const handleAction = (post: CommunityPost) => {
    if (post.actionable) {
      switch (post.actionable.type) {
        case 'book':
          alert(`Booking ${post.user.name} for ${post.actionable.price}`);
          break;
        case 'hire':
          alert(`Applying for position at ${post.user.name}`);
          break;
        case 'join':
          alert(`Joining event: ${post.content.substring(0, 50)}...`);
          break;
        case 'deliver':
          alert(`Setting up delivery for ${post.actionable.price}`);
          break;
      }
    }
  };

  const addComment = () => {
    if (newComment.trim() && selectedPost) {
      const comment: Comment = {
        id: Date.now().toString(),
        user: 'You',
        content: newComment.trim(),
        timestamp: 'Just now',
        avatar: 'https://via.placeholder.com/30x30'
      };

      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === selectedPost.id 
            ? { ...post, comments: [...post.comments, comment] }
            : post
        )
      );
      
      setNewComment('');
      setShowComments(false);
      setSelectedPost(null);
    }
  };

  const handleVote = (postId: string, optionId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId && post.poll) {
          const updatedOptions = post.poll.options.map(option => 
            option.id === optionId 
              ? { ...option, votes: option.votes + 1 }
              : option
          );
          return {
            ...post,
            poll: {
              ...post.poll,
              options: updatedOptions,
              totalVotes: post.poll.totalVotes + 1
            }
          };
        }
        return post;
      })
    );
  };

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
      
      {/* Poll Component */}
      {item.poll && (
        <View style={styles.pollContainer}>
          <Text style={styles.pollQuestion}>{item.poll.question}</Text>
          {item.poll.options.map((option) => {
            const percentage = (option.votes / item.poll!.totalVotes) * 100;
            return (
              <TouchableOpacity
                key={option.id}
                style={styles.pollOption}
                onPress={() => handleVote(item.id, option.id)}
              >
                <View style={styles.pollOptionContent}>
                  <Text style={styles.pollOptionText}>{option.text}</Text>
                  <Text style={styles.pollVotes}>{option.votes} votes</Text>
                </View>
                <View style={[styles.pollBar, { width: `${percentage}%` }]} />
              </TouchableOpacity>
            );
          })}
          <Text style={styles.pollTotal}>{item.poll.totalVotes} total votes</Text>
        </View>
      )}

      {/* Action Button */}
      {item.actionable && (
        <TouchableOpacity 
          style={[styles.actionButtonMain, { backgroundColor: getPostTypeColor(item.type) }]}
          onPress={() => handleAction(item)}
        >
          <Text style={styles.actionButtonText}>
            {item.actionable.label} • {item.actionable.price}
          </Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.postFooter}>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
        <View style={styles.postActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLike(item.id)}
          >
            <Ionicons 
              name={item.isLiked ? "heart" : "heart-outline"} 
              size={16} 
              color={item.isLiked ? "#FF3B30" : "#8E8E93"} 
            />
            <Text style={[styles.actionText, item.isLiked && { color: "#FF3B30" }]}>
              {item.likes}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleComment(item.id)}
          >
            <Ionicons name="chatbubble-outline" size={16} color="#8E8E93" />
            <Text style={styles.actionText}>{item.comments.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={16} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Comments Preview */}
      {item.comments.length > 0 && (
        <View style={styles.commentsPreview}>
          <TouchableOpacity onPress={() => handleComment(item.id)}>
            <Text style={styles.viewCommentsText}>
              View all {item.comments.length} comments
            </Text>
          </TouchableOpacity>
          {item.comments.slice(-2).map((comment) => (
            <View key={comment.id} style={styles.commentPreview}>
              <Image source={{ uri: comment.avatar }} style={styles.commentAvatar} />
              <View style={styles.commentContent}>
                <Text style={styles.commentUser}>{comment.user}</Text>
                <Text style={styles.commentText}>{comment.content}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
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
        data={posts.filter(post => activeTab === 'all' || post.type === activeTab)}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContainer}
      />

      {/* Comments Modal */}
      {showComments && selectedPost && (
        <View style={styles.modalOverlay}>
          <View style={styles.commentsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments</Text>
              <TouchableOpacity onPress={() => setShowComments(false)}>
                <Ionicons name="close" size={24} color="#1C1C1E" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.commentsScroll}>
              {selectedPost.comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <Image source={{ uri: comment.avatar }} style={styles.commentAvatar} />
                  <View style={styles.commentContent}>
                    <Text style={styles.commentUser}>{comment.user}</Text>
                    <Text style={styles.commentText}>{comment.content}</Text>
                    <Text style={styles.commentTime}>{comment.timestamp}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            
            <View style={styles.addCommentContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
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
      )}
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
  // Poll styles
  pollContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  pollQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  pollOption: {
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  pollOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  pollOptionText: {
    fontSize: 14,
    color: '#1C1C1E',
    flex: 1,
  },
  pollVotes: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  pollBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#E0E7FF',
    borderRadius: 8,
    opacity: 0.6,
  },
  pollTotal: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
  },
  // Action button styles
  actionButtonMain: {
    backgroundColor: '#6B46C1',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Comment styles
  commentsPreview: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  viewCommentsText: {
    fontSize: 14,
    color: '#6B46C1',
    fontWeight: '500',
    marginBottom: 8,
  },
  commentPreview: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  commentAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  commentContent: {
    flex: 1,
  },
  commentUser: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  commentText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  commentTime: {
    fontSize: 10,
    color: '#C7C7CC',
    marginTop: 2,
  },
  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  commentsModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  commentsScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  commentItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  addCommentContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    alignItems: 'flex-end',
  },
  commentInput: {
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
  sendCommentButton: {
    backgroundColor: '#6B46C1',
    borderRadius: 20,
    padding: 10,
  },
});

export default Community;