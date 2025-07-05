import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NavigationProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

const tabs = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'marketplace', label: 'Shops', icon: 'storefront' },
  { id: 'services', label: 'Services', icon: 'construct' },
  { id: 'hub', label: 'The Hub', icon: 'videocam' },
  { id: 'community', label: 'Community', icon: 'people' },
  { id: 'profile', label: 'Profile', icon: 'person' },
];

export default function Navigation({ activeTab, onTabPress }: NavigationProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          onPress={() => onTabPress(tab.id)}
        >
          <Ionicons
            name={activeTab === tab.id ? tab.icon as any : `${tab.icon}-outline` as any}
            size={24}
            color={activeTab === tab.id ? '#007AFF' : '#666'}
          />
          <Text style={[
            styles.tabLabel,
            activeTab === tab.id && styles.activeTabLabel
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 20,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tabLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  activeTabLabel: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
