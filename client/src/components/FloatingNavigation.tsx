import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NavigationProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

export default function FloatingNavigation({ activeTab, onTabPress }: NavigationProps) {
  const tabs = [
    { name: 'Home', icon: 'home' },
    { name: 'Marketplace', icon: 'storefront' },
    { name: 'Community', icon: 'people' },
    { name: 'Deliveries', icon: 'car' },
    { name: 'Menu', icon: 'menu' },
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
              size={20}
              color={activeTab === tab.name ? '#6B46C1' : '#8E8E93'}
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
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#E0E7FF',
  },
  tabText: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 2,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#6B46C1',
  },
});