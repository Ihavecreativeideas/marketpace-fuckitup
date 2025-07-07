import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NavigationProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

export default function FloatingNavigation({ activeTab, onTabPress }: NavigationProps) {
  const tabs = [
    { name: 'Home', icon: 'home-outline' },
    { name: 'Marketplace', icon: 'storefront-outline' },
    { name: 'Community', icon: 'people-outline' },
    { name: 'Deliveries', icon: 'car-outline' },
    { name: 'Menu', icon: 'menu-outline' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={[
              styles.tab,
              activeTab === tab.name && styles.activeTab,
            ]}
            onPress={() => onTabPress(tab.name)}
          >
            <Ionicons
              name={tab.icon as any}
              size={22}
              color={activeTab === tab.name ? '#6B46C1' : '#8E8E93'}
              style={{ fontWeight: '600' }}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.name && styles.activeTabText,
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    zIndex: 1000,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 16,
    flex: 1,
    maxWidth: 70,
  },
  activeTab: {
    backgroundColor: '#E0E7FF',
  },
  tabText: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 3,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#6B46C1',
  },
});