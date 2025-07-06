import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
}

interface LocalHighlight {
  id: string;
  type: 'business' | 'service' | 'event';
  title: string;
  subtitle: string;
  image: string;
  distance: string;
}

interface CommunityStats {
  totalMembers: number;
  localShops: number;
  activeDrivers: number;
  completedDeliveries: number;
}

export default function CommunityHome() {
  const communityStats: CommunityStats = {
    totalMembers: 2847,
    localShops: 156,
    activeDrivers: 34,
    completedDeliveries: 1023,
  };

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Sell Something',
      icon: 'add-circle',
      color: '#6B46C1',
      description: 'Turn unused items into income',
    },
    {
      id: '2',
      title: 'Find Local Help',
      icon: 'people',
      color: '#10B981',
      description: 'Hire neighbors for odd jobs',
    },
    {
      id: '3',
      title: 'Rent Equipment',
      icon: 'construct',
      color: '#F59E0B',
      description: 'Borrow tools from community',
    },
    {
      id: '4',
      title: 'Support Local',
      icon: 'heart',
      color: '#EF4444',
      description: 'Shop from neighborhood businesses',
    },
  ];

  const localHighlights: LocalHighlight[] = [
    {
      id: '1',
      type: 'business',
      title: 'Sarah\'s Fresh Bakery',
      subtitle: 'Now offering delivery via MarketPace',
      image: 'https://via.placeholder.com/100x80',
      distance: '0.3 miles',
    },
    {
      id: '2',
      type: 'event',
      title: 'Community Artisan Market',
      subtitle: 'This Saturday at Central Park',
      image: 'https://via.placeholder.com/100x80',
      distance: '0.8 miles',
    },
    {
      id: '3',
      type: 'service',
      title: 'Mike\'s Moving Help',
      subtitle: 'Local, affordable, reliable',
      image: 'https://via.placeholder.com/100x80',
      distance: '1.2 miles',
    },
  ];

  const renderQuickAction = ({ item }: { item: QuickAction }) => (
    <TouchableOpacity style={styles.actionCard}>
      <View style={[styles.actionIcon, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon as any} size={24} color="white" />
      </View>
      <Text style={styles.actionTitle}>{item.title}</Text>
      <Text style={styles.actionDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  const renderHighlight = ({ item }: { item: LocalHighlight }) => (
    <TouchableOpacity style={styles.highlightCard}>
      <Image source={{ uri: item.image }} style={styles.highlightImage} />
      <View style={styles.highlightContent}>
        <View style={styles.highlightHeader}>
          <Text style={styles.highlightTitle}>{item.title}</Text>
          <Text style={styles.highlightDistance}>{item.distance}</Text>
        </View>
        <Text style={styles.highlightSubtitle}>{item.subtitle}</Text>
        <View style={[styles.typeTag, { backgroundColor: getTypeColor(item.type) }]}>
          <Text style={styles.typeTagText}>{getTypeLabel(item.type)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'business': return '#6366F1';
      case 'service': return '#10B981';
      case 'event': return '#F59E0B';
      default: return '#8B5CF6';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'business': return 'LOCAL SHOP';
      case 'service': return 'SERVICE';
      case 'event': return 'EVENT';
      default: return 'COMMUNITY';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Cosmic Gradient */}
      <LinearGradient
        colors={['#1E1B4B', '#4C1D95', '#6B21A8']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome to MarketPace</Text>
            <Text style={styles.subtitle}>Pick Up the Pace in Your Community</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Image
              source={{ uri: 'https://via.placeholder.com/40x40' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        {/* Campaign Launch Banner */}
        <View style={styles.campaignBanner}>
          <View style={styles.campaignContent}>
            <Ionicons name="star" size={20} color="#F59E0B" />
            <Text style={styles.campaignText}>Campaign Launch - All Features FREE!</Text>
          </View>
          <Text style={styles.campaignSubtext}>Early supporters get lifetime benefits</Text>
        </View>
      </LinearGradient>

      {/* Community Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Your Community Impact</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{communityStats.totalMembers.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Community Members</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{communityStats.localShops}</Text>
            <Text style={styles.statLabel}>Local Shops</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{communityStats.activeDrivers}</Text>
            <Text style={styles.statLabel}>Active Drivers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{communityStats.completedDeliveries.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Deliveries Completed</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ways to Support Your Community</Text>
        <FlatList
          data={quickActions}
          renderItem={renderQuickAction}
          keyExtractor={(item) => item.id}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={styles.actionRow}
        />
      </View>

      {/* Local Highlights */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Local Highlights</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={localHighlights}
          renderItem={renderHighlight}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.highlightsContainer}
        />
      </View>

      {/* Mission Statement */}
      <View style={styles.missionContainer}>
        <LinearGradient
          colors={['#E0E7FF', '#C4B5FD']}
          style={styles.missionCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="heart" size={32} color="#6B46C1" />
          <Text style={styles.missionTitle}>Building Stronger Communities</Text>
          <Text style={styles.missionText}>
            When our neighbors thrive, we all rise. MarketPace is designed to circulate money 
            locally, create jobs, and strengthen the bonds that make communities powerful.
          </Text>
          <TouchableOpacity style={styles.missionButton}>
            <Text style={styles.missionButtonText}>Learn More</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: '#C4B5FD',
    marginTop: 4,
  },
  profileButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: 40,
    height: 40,
  },
  campaignBanner: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  campaignContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  campaignText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  campaignSubtext: {
    fontSize: 12,
    color: '#C4B5FD',
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B46C1',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 14,
    color: '#6B46C1',
    fontWeight: '600',
  },
  actionRow: {
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 16,
  },
  highlightsContainer: {
    paddingLeft: 20,
  },
  highlightCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginRight: 15,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  highlightImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  highlightContent: {
    padding: 15,
  },
  highlightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  highlightDistance: {
    fontSize: 12,
    color: '#8E8E93',
  },
  highlightSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 10,
  },
  typeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
  },
  missionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  missionCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  missionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4C1D95',
    marginTop: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  missionText: {
    fontSize: 14,
    color: '#5B21B6',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  missionButton: {
    backgroundColor: '#6B46C1',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  missionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});