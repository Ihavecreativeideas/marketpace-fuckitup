import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface UserAnalytics {
  interests: any[];
  recentBehavior: any[];
  sessions: any[];
  searches: any[];
  purchases: any[];
}

interface DataInsight {
  category: string;
  value: string;
  insight: string;
  confidence: number;
}

const UserDataAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [insights, setInsights] = useState<DataInsight[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserAnalytics();
  }, [selectedTimeframe]);

  const loadUserAnalytics = async () => {
    try {
      // Get current user analytics (businesses would access other user's data with proper permissions)
      const response = await fetch('/api/analytics/user/self', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
        generateDataInsights(data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDataInsights = (data: UserAnalytics) => {
    const insights: DataInsight[] = [];

    // Interest analysis
    if (data.interests?.length > 0) {
      const topInterest = data.interests[0];
      insights.push({
        category: 'Interest Profile',
        value: topInterest.category,
        insight: `Primary interest with ${topInterest.interactionCount} interactions`,
        confidence: Math.min(topInterest.score * 10, 100)
      });
    }

    // Behavior patterns
    if (data.recentBehavior?.length > 0) {
      const pageViews = data.recentBehavior.filter(b => b.eventType === 'page_view');
      const mostVisitedPages = pageViews.reduce((acc, behavior) => {
        acc[behavior.page] = (acc[behavior.page] || 0) + 1;
        return acc;
      }, {});
      
      const topPage = Object.entries(mostVisitedPages)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0];
      
      if (topPage) {
        insights.push({
          category: 'Browse Pattern',
          value: topPage[0],
          insight: `Most visited section (${topPage[1]} visits)`,
          confidence: 85
        });
      }
    }

    // Shopping behavior
    if (data.purchases?.length > 0) {
      const categories = data.purchases.map(p => p.category).filter(Boolean);
      const categoryCount = categories.reduce((acc, cat) => {
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});
      
      const topCategory = Object.entries(categoryCount)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0];
      
      if (topCategory) {
        insights.push({
          category: 'Purchase Behavior',
          value: topCategory[0],
          insight: `Frequent buyer in this category`,
          confidence: 90
        });
      }
    }

    // Search patterns
    if (data.searches?.length > 0) {
      const searchTerms = data.searches.map(s => s.query.toLowerCase());
      const commonWords = searchTerms.join(' ').split(' ')
        .filter(word => word.length > 3)
        .reduce((acc, word) => {
          acc[word] = (acc[word] || 0) + 1;
          return acc;
        }, {});
      
      const topSearchTerm = Object.entries(commonWords)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0];
      
      if (topSearchTerm && topSearchTerm[1] > 1) {
        insights.push({
          category: 'Search Intent',
          value: topSearchTerm[0],
          insight: `Frequently searched term`,
          confidence: 75
        });
      }
    }

    setInsights(insights);
  };

  const renderDataVisualization = (title: string, data: any[], renderItem: (item: any, index: number) => React.ReactNode) => (
    <View style={styles.visualizationCard}>
      <Text style={styles.visualizationTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {data.slice(0, 5).map(renderItem)}
      </ScrollView>
    </View>
  );

  const renderInterestBar = (interest: any, index: number) => (
    <View key={index} style={styles.interestBar}>
      <Text style={styles.interestCategory}>{interest.category}</Text>
      <View style={styles.scoreContainer}>
        <View style={[styles.scoreBar, { width: `${Math.min(interest.score * 20, 100)}%` }]} />
      </View>
      <Text style={styles.scoreText}>{Math.round(interest.score * 100)}%</Text>
    </View>
  );

  const renderBehaviorEvent = (behavior: any, index: number) => (
    <View key={index} style={styles.behaviorCard}>
      <Text style={styles.behaviorType}>{behavior.eventType}</Text>
      <Text style={styles.behaviorPage}>{behavior.page}</Text>
      <Text style={styles.behaviorTime}>
        {new Date(behavior.timestamp).toLocaleDateString()}
      </Text>
    </View>
  );

  const renderSearchQuery = (search: any, index: number) => (
    <View key={index} style={styles.searchCard}>
      <Text style={styles.searchQuery}>"{search.query}"</Text>
      <Text style={styles.searchCategory}>{search.category}</Text>
      <Text style={styles.searchResults}>{search.resultsShown} results</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Analytics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>User Data Analytics</Text>
        <Text style={styles.headerSubtitle}>Facebook-Style Data Collection & Insights</Text>
      </LinearGradient>

      <View style={styles.timeframeSelector}>
        {['7d', '30d', '90d', '1y'].map(period => (
          <TouchableOpacity
            key={period}
            style={[
              styles.timeframeButton,
              selectedTimeframe === period && styles.timeframeButtonActive
            ]}
            onPress={() => setSelectedTimeframe(period)}
          >
            <Text style={[
              styles.timeframeText,
              selectedTimeframe === period && styles.timeframeTextActive
            ]}>
              {period}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {/* Data Insights Section */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>AI-Generated Insights</Text>
          {insights.map((insight, index) => (
            <View key={index} style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Text style={styles.insightCategory}>{insight.category}</Text>
                <View style={styles.confidenceBar}>
                  <View style={[
                    styles.confidenceFill,
                    { width: `${insight.confidence}%` }
                  ]} />
                </View>
              </View>
              <Text style={styles.insightValue}>{insight.value}</Text>
              <Text style={styles.insightText}>{insight.insight}</Text>
            </View>
          ))}
        </View>

        {/* User Interests */}
        {analytics?.interests && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interest Profile</Text>
            <View style={styles.interestsContainer}>
              {analytics.interests.slice(0, 8).map(renderInterestBar)}
            </View>
          </View>
        )}

        {/* Recent Behavior */}
        {analytics?.recentBehavior && (
          renderDataVisualization(
            'Recent Activity',
            analytics.recentBehavior,
            renderBehaviorEvent
          )
        )}

        {/* Search History */}
        {analytics?.searches && (
          renderDataVisualization(
            'Search Patterns',
            analytics.searches,
            renderSearchQuery
          )
        )}

        {/* Session Data */}
        <View style={styles.sessionStats}>
          <Text style={styles.sectionTitle}>Session Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {analytics?.sessions?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Total Sessions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {analytics?.recentBehavior?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Page Views</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {analytics?.searches?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Searches</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {analytics?.purchases?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Purchases</Text>
            </View>
          </View>
        </View>

        {/* Privacy Notice */}
        <View style={styles.privacyNotice}>
          <Text style={styles.privacyTitle}>Data Collection Notice</Text>
          <Text style={styles.privacyText}>
            This demo shows the type of comprehensive user data that can be collected and analyzed 
            for targeted advertising purposes, similar to Facebook's data collection practices. 
            In a real application, proper consent and privacy controls would be implemented.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginTop: 5,
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  timeframeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  timeframeButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  timeframeText: {
    color: '#64748b',
    fontWeight: '600',
  },
  timeframeTextActive: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 15,
  },
  insightsSection: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  insightCard: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  insightCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  confidenceBar: {
    width: 60,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  insightValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  insightText: {
    fontSize: 14,
    color: '#64748b',
  },
  interestsContainer: {
    marginTop: 10,
  },
  interestBar: {
    marginBottom: 15,
  },
  interestCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 5,
  },
  scoreContainer: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 5,
  },
  scoreBar: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  scoreText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'right',
  },
  visualizationCard: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
  },
  visualizationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 15,
  },
  behaviorCard: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    minWidth: 120,
  },
  behaviorType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
    textTransform: 'capitalize',
  },
  behaviorPage: {
    fontSize: 14,
    color: '#1e293b',
    marginVertical: 2,
  },
  behaviorTime: {
    fontSize: 10,
    color: '#64748b',
  },
  searchCard: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    minWidth: 150,
  },
  searchQuery: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 3,
  },
  searchCategory: {
    fontSize: 12,
    color: '#667eea',
    marginBottom: 2,
  },
  searchResults: {
    fontSize: 10,
    color: '#64748b',
  },
  sessionStats: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 12,
    marginRight: '2%',
    marginBottom: 10,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 5,
    textAlign: 'center',
  },
  privacyNotice: {
    backgroundColor: '#fef3c7',
    padding: 20,
    marginBottom: 20,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 10,
  },
  privacyText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
});

export default UserDataAnalytics;