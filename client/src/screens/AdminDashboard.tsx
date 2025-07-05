import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';

export default function AdminDashboard({ navigation }: any) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState('shops');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: adminStats } = useQuery({
    queryKey: ['/api/admin-stats'],
    queryFn: () => apiRequest('GET', '/api/admin-stats'),
    enabled: !!user && user.userType === 'admin',
  });

  const { data: driverApplications = [] } = useQuery({
    queryKey: ['/api/admin/driver-applications'],
    queryFn: () => apiRequest('GET', '/api/admin/driver-applications'),
    enabled: !!user && user.userType === 'admin',
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: () => apiRequest('GET', '/api/categories'),
    enabled: !!user && user.userType === 'admin',
  });

  const updateApplicationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest('PUT', `/api/admin/driver-applications/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/driver-applications'] });
      toast({
        title: 'Success',
        description: 'Driver application updated successfully',
        variant: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update driver application',
        variant: 'error',
      });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: any) => {
      return apiRequest('POST', '/api/admin/categories', categoryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setShowCreateCategory(false);
      setNewCategoryName('');
      toast({
        title: 'Success',
        description: 'Category created successfully',
        variant: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create category',
        variant: 'error',
      });
    },
  });

  const tabs = [
    { id: 'overview', name: 'Overview', icon: 'analytics' },
    { id: 'drivers', name: 'Drivers', icon: 'car' },
    { id: 'categories', name: 'Categories', icon: 'grid' },
    { id: 'users', name: 'Users', icon: 'people' },
    { id: 'content', name: 'Content', icon: 'document' },
  ];

  const renderDriverApplication = ({ item }: { item: any }) => (
    <Card style={styles.applicationCard}>
      <View style={styles.applicationHeader}>
        <Text style={styles.applicantName}>
          {item.user.firstName} {item.user.lastName}
        </Text>
        <Badge 
          text={item.status} 
          variant={
            item.status === 'approved' ? 'success' :
            item.status === 'rejected' ? 'error' : 'warning'
          } 
        />
      </View>
      <Text style={styles.applicantEmail}>{item.user.email}</Text>
      <Text style={styles.applicationDate}>
        Applied: {new Date(item.createdAt).toLocaleDateString()}
      </Text>
      
      <View style={styles.applicationDetails}>
        <Text style={styles.detailLabel}>License #: {item.licenseNumber}</Text>
        {item.vehicleInfo && (
          <Text style={styles.detailLabel}>
            Vehicle: {item.vehicleInfo.make} {item.vehicleInfo.model} ({item.vehicleInfo.year})
          </Text>
        )}
      </View>

      {item.status === 'pending' && (
        <View style={styles.applicationActions}>
          <Button
            title="Approve"
            onPress={() => handleUpdateApplication(item.id, 'approved')}
            size="small"
            style={styles.approveButton}
          />
          <Button
            title="Reject"
            onPress={() => handleUpdateApplication(item.id, 'rejected')}
            variant="outline"
            size="small"
            style={styles.rejectButton}
          />
        </View>
      )}
    </Card>
  );

  const renderCategory = ({ item }: { item: any }) => (
    <Card style={styles.categoryCard}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Badge text={item.type} variant="info" size="small" />
      </View>
      <Text style={styles.categoryStats}>
        {item.listingsCount || 0} listings
      </Text>
    </Card>
  );

  const handleUpdateApplication = (id: number, status: string) => {
    updateApplicationMutation.mutate({ id, status });
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;
    
    createCategoryMutation.mutate({
      name: newCategoryName,
      type: newCategoryType,
    });
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Platform Overview</Text>
      
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{adminStats?.totalUsers || 0}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{adminStats?.totalListings || 0}</Text>
          <Text style={styles.statLabel}>Active Listings</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{adminStats?.totalOrders || 0}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{adminStats?.activeDrivers || 0}</Text>
          <Text style={styles.statLabel}>Active Drivers</Text>
        </Card>
      </View>

      <Card style={styles.revenueCard}>
        <Text style={styles.revenueTitle}>Revenue Analytics</Text>
        <Text style={styles.revenueAmount}>
          ${adminStats?.totalRevenue?.toFixed(2) || '0.00'}
        </Text>
        <Text style={styles.revenueSubtitle}>Total Platform Revenue</Text>
      </Card>

      <Card style={styles.quickActionsCard}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="add-circle" size={24} color="#007AFF" />
            <Text style={styles.quickActionText}>Add Category</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="ban" size={24} color="#FF3B30" />
            <Text style={styles.quickActionText}>Moderate Content</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="settings" size={24} color="#666" />
            <Text style={styles.quickActionText}>App Settings</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </View>
  );

  const renderDrivers = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Driver Applications</Text>
        <Badge text={`${driverApplications.length} pending`} variant="warning" />
      </View>
      
      <FlatList
        data={driverApplications}
        renderItem={renderDriverApplication}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Card style={styles.emptyState}>
            <Ionicons name="car-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No pending applications</Text>
            <Text style={styles.emptyStateSubtitle}>
              All driver applications have been reviewed
            </Text>
          </Card>
        }
      />
    </View>
  );

  const renderCategories = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <Button
          title="Add Category"
          onPress={() => setShowCreateCategory(true)}
          size="small"
        />
      </View>
      
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.categoryRow}
      />
    </View>
  );

  if (user?.userType !== 'admin') {
    return (
      <View style={styles.container}>
        <View style={styles.errorState}>
          <Ionicons name="shield-outline" size={64} color="#ccc" />
          <Text style={styles.errorTitle}>Admin Access Required</Text>
          <Text style={styles.errorSubtitle}>
            You need admin privileges to access this dashboard
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                selectedTab === tab.id && styles.activeTab,
              ]}
              onPress={() => setSelectedTab(tab.id)}
            >
              <Ionicons
                name={tab.icon as any}
                size={20}
                color={selectedTab === tab.id ? '#007AFF' : '#666'}
              />
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab.id && styles.activeTabText,
                ]}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'drivers' && renderDrivers()}
        {selectedTab === 'categories' && renderCategories()}
        {selectedTab === 'users' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>User Management</Text>
            <Text style={styles.placeholderText}>User management features coming soon</Text>
          </View>
        )}
        {selectedTab === 'content' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Content Moderation</Text>
            <Text style={styles.placeholderText}>Content moderation tools coming soon</Text>
          </View>
        )}
      </ScrollView>

      {/* Create Category Modal */}
      <Modal
        visible={showCreateCategory}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateCategory(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Category</Text>
            <TouchableOpacity onPress={handleCreateCategory}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Input
              label="Category Name"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="Enter category name"
            />
            
            <Text style={styles.inputLabel}>Category Type</Text>
            <View style={styles.typeSelector}>
              {['shops', 'services', 'entertainment'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeOption,
                    newCategoryType === type && styles.selectedTypeOption,
                  ]}
                  onPress={() => setNewCategoryType(type)}
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      newCategoryType === type && styles.selectedTypeOptionText,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
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
  tabBar: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  revenueCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 20,
    backgroundColor: '#4CAF50',
  },
  revenueTitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
  },
  revenueAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  revenueSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  quickActionsCard: {
    marginBottom: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAction: {
    alignItems: 'center',
    padding: 16,
  },
  quickActionText: {
    fontSize: 12,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  applicationCard: {
    marginBottom: 16,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  applicantEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  applicationDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  applicationDetails: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
  },
  applicationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  approveButton: {
    flex: 1,
    marginRight: 8,
  },
  rejectButton: {
    flex: 1,
  },
  categoryCard: {
    flex: 1,
    marginHorizontal: 6,
    marginBottom: 12,
  },
  categoryRow: {
    justifyContent: 'space-between',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryStats: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalCancel: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalSave: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    marginTop: 8,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedTypeOption: {
    backgroundColor: '#007AFF',
  },
  typeOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedTypeOptionText: {
    color: 'white',
  },
});
