import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/common/Header';
import { colors } from '../../utils/colors';
import { api } from '../../services/api';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState({
    notifications: true,
    emailMarketing: false,
    locationServices: true,
    dataSharing: false,
  });

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const response = await api.get('/user/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSettingChange = async (setting, value) => {
    try {
      await api.put('/user/settings', { [setting]: value });
      setSettings(prev => ({ ...prev, [setting]: value }));
    } catch (error) {
      console.error('Error updating setting:', error);
      Alert.alert('Error', 'Failed to update setting');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: confirmDeleteAccount },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    try {
      await api.delete('/user/account');
      logout();
      Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', 'Failed to delete account');
    }
  };

  const menuItems = [
    {
      title: 'Personal Information',
      icon: 'person-outline',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      title: 'Business Profile',
      icon: 'business-outline',
      onPress: () => navigation.navigate('BusinessProfile'),
      showBadge: !user?.businessProfile,
    },
    {
      title: 'My Listings',
      icon: 'list-outline',
      onPress: () => navigation.navigate('MyListings'),
    },
    {
      title: 'Order History',
      icon: 'receipt-outline',
      onPress: () => navigation.navigate('OrderHistory'),
    },
    {
      title: 'Payment Methods',
      icon: 'card-outline',
      onPress: () => navigation.navigate('PaymentMethods'),
    },
    {
      title: 'Addresses',
      icon: 'location-outline',
      onPress: () => navigation.navigate('Addresses'),
    },
    {
      title: 'Privacy & Security',
      icon: 'shield-outline',
      onPress: () => navigation.navigate('PrivacySecurity'),
    },
    {
      title: 'Help & Support',
      icon: 'help-circle-outline',
      onPress: () => navigation.navigate('HelpSupport'),
    },
    {
      title: 'About',
      icon: 'information-circle-outline',
      onPress: () => navigation.navigate('About'),
    },
  ];

  const renderMenuItem = (item, index) => (
    <TouchableOpacity
      key={index}
      style={styles.menuItem}
      onPress={item.onPress}
    >
      <View style={styles.menuItemLeft}>
        <Ionicons name={item.icon} size={24} color={colors.text} />
        <Text style={styles.menuItemText}>{item.title}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {item.showBadge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>New</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color={colors.gray} />
      </View>
    </TouchableOpacity>
  );

  const renderSettingItem = (title, key, description) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Text style={styles.settingTitle}>{title}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      <Switch
        value={settings[key]}
        onValueChange={(value) => handleSettingChange(key, value)}
        trackColor={{ false: colors.lightGray, true: colors.primary }}
        thumbColor={settings[key] ? colors.white : colors.gray}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Profile"
        rightComponent={
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
            <Ionicons name="create-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: user?.profileImage || 'https://via.placeholder.com/100' }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          
          {/* Profile Stats */}
          <View style={styles.profileStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Listings</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>5.0</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {menuItems.map((item, index) => renderMenuItem(item, index))}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {renderSettingItem(
            'Push Notifications',
            'notifications',
            'Receive notifications about orders and updates'
          )}
          {renderSettingItem(
            'Email Marketing',
            'emailMarketing',
            'Receive promotional emails and offers'
          )}
          {renderSettingItem(
            'Location Services',
            'locationServices',
            'Allow location access for better delivery experience'
          )}
          {renderSettingItem(
            'Data Sharing',
            'dataSharing',
            'Share usage data to improve the app'
          )}
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={colors.text} />
            <Text style={styles.actionButtonText}>Logout</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteAccount}
          >
            <Ionicons name="trash-outline" size={24} color={colors.error} />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>MarketPace v1.0.0</Text>
        </View>
      </ScrollView>
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
  profileHeader: {
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 24,
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: colors.gray,
    marginBottom: 20,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 4,
  },
  section: {
    backgroundColor: colors.white,
    marginBottom: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 16,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: colors.gray,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionButtonText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 16,
  },
  deleteButton: {
    marginTop: 8,
  },
  deleteButtonText: {
    color: colors.error,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  versionText: {
    fontSize: 14,
    color: colors.gray,
  },
});
