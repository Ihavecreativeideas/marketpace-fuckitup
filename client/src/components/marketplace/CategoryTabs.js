import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';
import { CATEGORIES } from '../../utils/constants';

const categoryData = [
  { key: 'all', label: 'All', icon: '🏪' },
  { key: CATEGORIES.SHOPS, label: 'Shops', icon: '🛍️' },
  { key: CATEGORIES.SERVICES, label: 'Services', icon: '🔧' },
  { key: CATEGORIES.ENTERTAINMENT, label: 'Entertainment', icon: '🎬' },
  { key: 'rentals', label: 'Rentals', icon: '📦' },
  { key: 'food', label: 'Food & Drinks', icon: '🍕' },
  { key: 'electronics', label: 'Electronics', icon: '📱' },
  { key: 'fashion', label: 'Fashion', icon: '👕' },
  { key: 'home', label: 'Home & Garden', icon: '🏠' },
  { key: 'sports', label: 'Sports', icon: '⚽' },
  { key: 'books', label: 'Books', icon: '📚' },
  { key: 'vehicles', label: 'Vehicles', icon: '🚗' },
];

export default function CategoryTabs({ 
  selectedCategory, 
  onCategoryChange,
  style = {}
}) {
  return (
    <View style={[styles.container, style]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {categoryData.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryTab,
              selectedCategory === category.key && styles.selectedTab
            ]}
            onPress={() => onCategoryChange(category.key)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={[
              styles.categoryText,
              selectedCategory === category.key && styles.selectedText
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  scrollContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  categoryTab: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginRight: Spacing.sm,
    borderRadius: Spacing.borderRadius.lg,
    backgroundColor: Colors.lightGray,
    minWidth: 80,
  },
  selectedTab: {
    backgroundColor: Colors.primary,
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: Spacing.xs,
  },
  categoryText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedText: {
    color: Colors.white,
    fontWeight: '600',
  },
});
