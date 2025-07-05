import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function Profile({ navigation }: any) {
  const { user } = useAuth();

  const { data: userStats } = useQuery({
    queryKey: ['/api/user-stats'],
    queryFn: () => apiRequest('GET', '/api/user-stats'),
    enabled: !!user,
  });

  const { data: driverApplication } = useQuery({
    queryKey: ['/api/driver-application'],
    queryFn: () => apiRequest('GET', '/api/driver-application'),
    enabled: !!user,
  });

  const profileMenuItems = [
    {
      id: 'listings',
      title: 'My Listings',
      icon: 'storefront',
      description: 'Manage your items for sale',
      onPress: () => navigation.navigate('MyListings'),
    },
    {
      id: 'orders',
      title: 'My Orders',
      icon: 'receipt',
      description: 'View order history',
      onPress: () => navigation.navigate('MyOrders'),
    },
    {
      id: 'driver',
      title: user?.userType === 'driver' ? 'Driver Dashboard' : 'Become a Driver',
      icon: 'car',
      description: user?.userType === 'driver' 
        ? 'Manage deliveries and earnings' 
        : 'Start delivering and earning',
      onPress: () => {
        if (user?.userType === 'driver') {
          navigation.navigate('DriverDashboard');
        } else {
          navigation.navigate('DriverApplication');
        }
      },
    },
    {
      id: 'admin',
      title: 'Admin Dashboard',
      icon: 'settings',
      description: 'Manage app settings',
      onPress: () => navigation.navigate('AdminDashboard'),
      visible: user?.userType === 'admin',
    },
    {
      id: 'pro',
      title: 'MarketPace Pro',
      icon: 'star',
      description: user?.isPro ? 'Manage subscription' : 'Upgrade to Pro',
      onPress: () => navigation.navigate('Subscribe'),
      badge: !user?.isPro ? 'Upgrade' : 'Active',
    },
  ];

  const settingsItems = [
    {
      id: 'notifications',
      title: 'Push Notifications',
      icon: 'notifications',
      type: 'toggle',
      value: true,
    },
    {
      id: 'location',
      title: 'Location Services',
      icon: 'location',
      type: 'toggle',
      value: true,
    },
    {
      id: 'privacy',
      title: 'Privacy Settings',
      icon: 'shield',
      type: 'navigation',
      onPress: () => console.log('Privacy settings'),
    },
    {
      id: 'support',
      title: 'Help & Support',
      icon: 'help-circle',
      type: 'navigation',
      onPress: () => console.log('Help & Support'),
    },
    {
      id: 'about',
      title: 'About MarketPace',
      icon: 'information-circle',
      type: 'navigation',
      onPress: () => console.log('About'),
    },
  ];

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const renderMenuItem = (item: any) => {
    if (item.visible === false) return null;

    return (
      <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
        <View style={styles.menuItemContent}>
          <View style={styles.menuItemLeft}>
            <View style={styles.menuItemIcon}>
              <Ionicons name={item.icon} size={24} color="#007AFF" />
            </View>
            <View style={styles.menuItemText}>
              <Text style={styles.menuItemTitle}>{item.title}</Text>
              <Text style={styles.menuItemDescription}>{item.description}</Text>
            </View>
          </View>
          <View style={styles.menuItemRight}>
            {item.badge && (
              <Badge 
                text={item.badge} 
                variant={item.badge === 'Active' ? 'success' : 'warning'} 
                size="small" 
              />
            )}
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSettingItem = (item: any) => (
    <View key={item.id} style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Ionicons name={item.icon} size={24} color="#666" />
        <Text style={styles.settingTitle}>{item.title}</Text>
      </View>
      {item.type === 'toggle' ? (
        <Switch value={item.value} onValueChange={() => {}} />
      ) : (
        <TouchableOpacity onPress={item.onPress}>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      )}
    </View>
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Please log in to view your profile</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => console.log('Edit profile')}>
          <Ionicons name="create-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Profile Info */}
      <Card style={styles.profileCard}>
        <View style={styles.profileContent}>
          <Image
            source={{
              uri: user.profileImageUrl || 'https://via.placeholder.com/80x80',
            }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
            <View style={styles.profileBadges}>
              <Badge text={user.accountType || 'Personal'} variant="info" size="small" />
              {user.isPro && <Badge text="Pro" variant="warning" size="small" />}
              {user.userType === 'driver' && (
                <Badge text="Driver" variant="success" size="small" />
              )}
            </View>
          </View>
        </View>
        
        {userStats && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.listings || 0}</Text>
              <Text style={styles.statLabel}>Listings</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.orders || 0}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.rating || '5.0'}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        )}
      </Card>

      {/* Driver Status */}
      {driverApplication && (
        <Card style={styles.driverCard}>
          <View style={styles.driverStatus}>
            <Ionicons name="car" size={24} color="#007AFF" />
            <View style={styles.driverInfo}>
              <Text style={styles.driverTitle}>Driver Application</Text>
              <Text style={styles.driverSubtitle}>
                Status: {driverApplication.status}
              </Text>
            </View>
            <Badge 
              text={driverApplication.status} 
              variant={
                driverApplication.status === 'approved' ? 'success' :
                driverApplication.status === 'rejected' ? 'error' : 'warning'
              }
            />
          </View>
        </Card>
      )}

      {/* Menu Items */}
      <Card style={styles.menuCard}>
        <Text style={styles.sectionTitle}>Account</Text>
        {profileMenuItems.map(renderMenuItem)}
      </Card>

      {/* Settings */}
      <Card style={styles.settingsCard}>
        <Text style={styles.sectionTitle}>Settings</Text>
        {settingsItems.map(renderSettingItem)}
      </Card>

      {/* Account Actions */}
      <Card style={styles.actionsCard}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="person-add" size={20} color="#007AFF" />
          <Text style={styles.actionButtonText}>Switch to Business Account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="document-text" size={20} color="#666" />
          <Text style={styles.actionButtonText}>Terms & Privacy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#FF3B30" />
          <Text style={[styles.actionButtonText, styles.logoutText]}>Sign Out</Text>
        </TouchableOpacity>
      </Card>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>MarketPace v1.0.0</Text>
      </View>
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
  profileCard: {
    margin: 16,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  profileBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  driverCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  driverStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverInfo: {
    flex: 1,
    marginLeft: 12,
  },
  driverTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  driverSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  menuCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  menuItem: {
    marginBottom: 12,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  menuItemDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  actionsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 12,
  },
  logoutButton: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#FF3B30',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
});
