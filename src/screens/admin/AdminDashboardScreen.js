import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/common/Header';
import { colors } from '../../utils/colors';
import { api } from '../../services/api';

export default function AdminDashboardScreen({ navigation }) {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalListings: 0,
    totalOrders: 0,
    totalDrivers: 0,
    revenue: 0,
    activeDeliveries: 0,
    pendingApprovals: 0,
    reportedContent: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [reportedItems, setReportedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [aiAssistantVisible, setAiAssistantVisible] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user?.isAdmin) {
      loadAdminData();
    }
  }, [user, selectedTab]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, activityRes, driversRes, reportsRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/activity'),
        api.get('/admin/drivers/pending'),
        api.get('/admin/reports'),
      ]);

      setAnalytics(analyticsRes.data);
      setRecentActivity(activityRes.data);
      setPendingDrivers(driversRes.data);
      setReportedItems(reportsRes.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
      Alert.alert('Error', 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAdminData();
    setRefreshing(false);
  };

  const handleDriverApproval = async (driverId, approved) => {
    try {
      await api.post(`/admin/drivers/${driverId}/approve`, { approved });
      Alert.alert(
        'Driver ' + (approved ? 'Approved' : 'Rejected'),
        approved 
          ? 'Driver has been approved and will receive login credentials'
          : 'Driver application has been rejected'
      );
      loadAdminData();
    } catch (error) {
      console.error('Error updating driver status:', error);
      Alert.alert('Error', 'Failed to update driver status');
    }
  };

  const handleReportAction = async (reportId, action) => {
    try {
      await api.post(`/admin/reports/${reportId}/action`, { action });
      Alert.alert('Success', `Report has been ${action}`);
      loadAdminData();
    } catch (error) {
      console.error('Error handling report:', error);
      Alert.alert('Error', 'Failed to handle report');
    }
  };

  const handleAiAssistant = async () => {
    if (!aiQuery.trim()) {
      Alert.alert('Error', 'Please enter a query for the AI assistant');
      return;
    }

    try {
      const response = await api.post('/admin/ai-assistant', { query: aiQuery });
      Alert.alert('AI Assistant Response', response.data.response);
      setAiQuery('');
    } catch (error) {
      console.error('Error with AI assistant:', error);
      Alert.alert('Error', 'AI assistant is currently unavailable');
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: 'analytics' },
    { id: 'users', name: 'Users', icon: 'people' },
    { id: 'listings', name: 'Listings', icon: 'storefront' },
    { id: 'drivers', name: 'Drivers', icon: 'car' },
    { id: 'reports', name: 'Reports', icon: 'flag' },
    { id: 'settings', name: 'Settings', icon: 'settings' },
  ];

  const analyticsCards = [
    { title: 'Total Users', value: analytics.totalUsers, icon: 'people', color: colors.primary },
    { title: 'Total Listings', value: analytics.totalListings, icon: 'storefront', color: colors.success },
    { title: 'Total Orders', value: analytics.totalOrders, icon: 'receipt', color: colors.warning },
    { title: 'Active Drivers', value: analytics.totalDrivers, icon: 'car', color: colors.info },
    { title: 'Revenue', value: `$${analytics.revenue.toLocaleString()}`, icon: 'card', color: colors.primary },
    { title: 'Active Deliveries', value: analytics.activeDeliveries, icon: 'bicycle', color: colors.success },
  ];

  const renderAnalyticsCard = ({ item }) => (
    <View style={[styles.analyticsCard, { borderLeftColor: item.color }]}>
      <View style={styles.cardIcon}>
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={[styles.cardValue, { color: item.color }]}>{item.value}</Text>
      </View>
    </View>
  );

  const renderActivityItem = ({ item }) => (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon} size={16} color={item.color} />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityText}>{item.description}</Text>
        <Text style={styles.activityTime}>{item.timestamp}</Text>
      </View>
    </View>
  );

  const renderDriverItem = ({ item }) => (
    <View style={styles.driverItem}>
      <View style={styles.driverInfo}>
        <Text style={styles.driverName}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.driverEmail}>{item.email}</Text>
        <Text style={styles.driverDate}>Applied: {item.applicationDate}</Text>
      </View>
      <View style={styles.driverActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleDriverApproval(item.id, true)}
        >
          <Ionicons name="checkmark" size={16} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleDriverApproval(item.id, false)}
        >
          <Ionicons name="close" size={16} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReportItem = ({ item }) => (
    <View style={styles.reportItem}>
      <View style={styles.reportInfo}>
        <Text style={styles.reportType}>{item.type}</Text>
        <Text style={styles.reportReason}>{item.reason}</Text>
        <Text style={styles.reportDate}>{item.reportDate}</Text>
      </View>
      <View style={styles.reportActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.resolveButton]}
          onPress={() => handleReportAction(item.id, 'resolved')}
        >
          <Text style={styles.actionButtonText}>Resolve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.dismissButton]}
          onPress={() => handleReportAction(item.id, 'dismissed')}
        >
          <Text style={styles.actionButtonText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!user?.isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Admin Dashboard" />
        <View style={styles.noAccessContainer}>
          <Ionicons name="shield-outline" size={64} color={colors.gray} />
          <Text style={styles.noAccessTitle}>Access Denied</Text>
          <Text style={styles.noAccessText}>
            You don't have admin privileges to access this dashboard.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Admin Dashboard"
        rightComponent={
          <TouchableOpacity
            onPress={() => setAiAssistantVisible(true)}
            style={styles.aiButton}
          >
            <Ionicons name="sparkles" size={24} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      <View style={styles.content}>
        {/* Tab Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabBar}
          contentContainerStyle={styles.tabBarContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, selectedTab === tab.id && styles.activeTab]}
              onPress={() => setSelectedTab(tab.id)}
            >
              <Ionicons
                name={tab.icon}
                size={20}
                color={selectedTab === tab.id ? colors.white : colors.gray}
              />
              <Text style={[
                styles.tabText,
                selectedTab === tab.id && styles.activeTabText
              ]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          style={styles.tabContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {selectedTab === 'overview' && (
            <>
              {/* Analytics Cards */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Analytics Overview</Text>
                <FlatList
                  data={analyticsCards}
                  renderItem={renderAnalyticsCard}
                  keyExtractor={(item) => item.title}
                  numColumns={2}
                  scrollEnabled={false}
                />
              </View>

              {/* Quick Actions */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickActions}>
                  <TouchableOpacity
                    style={styles.quickAction}
                    onPress={() => setSelectedTab('drivers')}
                  >
                    <Ionicons name="car" size={24} color={colors.primary} />
                    <Text style={styles.quickActionText}>Pending Drivers</Text>
                    {analytics.pendingApprovals > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{analytics.pendingApprovals}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickAction}
                    onPress={() => setSelectedTab('reports')}
                  >
                    <Ionicons name="flag" size={24} color={colors.warning} />
                    <Text style={styles.quickActionText}>Reports</Text>
                    {analytics.reportedContent > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{analytics.reportedContent}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickAction}
                    onPress={() => navigation.navigate('SystemSettings')}
                  >
                    <Ionicons name="settings" size={24} color={colors.info} />
                    <Text style={styles.quickActionText}>Settings</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Recent Activity */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <FlatList
                  data={recentActivity.slice(0, 10)}
                  renderItem={renderActivityItem}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                />
              </View>
            </>
          )}

          {selectedTab === 'drivers' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pending Driver Applications</Text>
              <FlatList
                data={pendingDrivers}
                renderItem={renderDriverItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Ionicons name="car-outline" size={48} color={colors.gray} />
                    <Text style={styles.emptyStateText}>No pending driver applications</Text>
                  </View>
                }
              />
            </View>
          )}

          {selectedTab === 'reports' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reported Content</Text>
              <FlatList
                data={reportedItems}
                renderItem={renderReportItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Ionicons name="shield-checkmark-outline" size={48} color={colors.gray} />
                    <Text style={styles.emptyStateText}>No reported content</Text>
                  </View>
                }
              />
            </View>
          )}

          {/* Add other tab content as needed */}
        </ScrollView>
      </View>

      {/* AI Assistant Modal */}
      <Modal
        visible={aiAssistantVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAiAssistantVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>AI Coding Assistant</Text>
            <TouchableOpacity onPress={() => setAiAssistantVisible(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Ask the AI assistant to help you edit the app or analyze data.
            </Text>
            <TextInput
              style={styles.aiInput}
              value={aiQuery}
              onChangeText={setAiQuery}
              placeholder="What would you like me to help you with?"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity style={styles.aiSubmitButton} onPress={handleAiAssistant}>
              <Text style={styles.aiSubmitButtonText}>Ask AI Assistant</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
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
  aiButton: {
    backgroundColor: colors.primary + '20',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noAccessContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  noAccessTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  noAccessText: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
  tabBar: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  tabBarContent: {
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.lightGray,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.gray,
    marginLeft: 6,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.white,
  },
  tabContent: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.white,
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 8,
    margin: 4,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAction: {
    alignItems: 'center',
    position: 'relative',
  },
  quickActionText: {
    fontSize: 12,
    color: colors.text,
    marginTop: 8,
    fontWeight: '500',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: colors.gray,
  },
  driverItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  driverEmail: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 2,
  },
  driverDate: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  driverActions: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: colors.success,
  },
  rejectButton: {
    backgroundColor: colors.error,
  },
  resolveButton: {
    backgroundColor: colors.primary,
  },
  dismissButton: {
    backgroundColor: colors.gray,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  reportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  reportInfo: {
    flex: 1,
  },
  reportType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  reportReason: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 2,
  },
  reportDate: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  reportActions: {
    flexDirection: 'row',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.gray,
    marginTop: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalDescription: {
    fontSize: 16,
    color: colors.gray,
    marginBottom: 16,
    lineHeight: 22,
  },
  aiInput: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  aiSubmitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  aiSubmitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
