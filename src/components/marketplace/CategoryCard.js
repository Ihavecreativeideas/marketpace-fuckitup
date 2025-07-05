import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 64) / 3; // Account for margins and spacing between 3 cards

export default function CategoryCard({
  category,
  onPress,
  style,
  size = 'medium', // small, medium, large
}) {
  const getCardWidth = () => {
    switch (size) {
      case 'small':
        return CARD_WIDTH * 0.8;
      case 'large':
        return CARD_WIDTH * 1.2;
      default:
        return CARD_WIDTH;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'large':
        return 40;
      default:
        return 32;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 16;
      default:
        return 14;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: getCardWidth(),
          backgroundColor: category.color + '10' || colors.lightGray,
        },
        style
      ]}
      onPress={() => onPress && onPress(category)}
      activeOpacity={0.7}
    >
      <View style={[
        styles.iconContainer,
        { backgroundColor: category.color || colors.primary }
      ]}>
        <Ionicons
          name={category.icon || 'apps'}
          size={getIconSize()}
          color={colors.white}
        />
      </View>

      <Text
        style={[
          styles.title,
          { fontSize: getTextSize() }
        ]}
        numberOfLines={2}
      >
        {category.title || category.name}
      </Text>

      {category.description && size !== 'small' && (
        <Text style={styles.description} numberOfLines={2}>
          {category.description}
        </Text>
      )}

      {category.count && (
        <View style={styles.countContainer}>
          <Text style={styles.count}>
            {category.count} {category.count === 1 ? 'item' : 'items'}
          </Text>
        </View>
      )}

      {category.isNew && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW</Text>
        </View>
      )}

      {category.isPopular && (
        <View style={styles.popularBadge}>
          <Ionicons name="trending-up" size={12} color={colors.white} />
        </View>
      )}
    </TouchableOpacity>
  );
}

// Horizontal category card variant
export function HorizontalCategoryCard({
  category,
  onPress,
  style,
  showDescription = true,
}) {
  return (
    <TouchableOpacity
      style={[styles.horizontalContainer, style]}
      onPress={() => onPress && onPress(category)}
      activeOpacity={0.7}
    >
      <View style={[
        styles.horizontalIconContainer,
        { backgroundColor: category.color || colors.primary }
      ]}>
        <Ionicons
          name={category.icon || 'apps'}
          size={24}
          color={colors.white}
        />
      </View>

      <View style={styles.horizontalContent}>
        <Text style={styles.horizontalTitle} numberOfLines={1}>
          {category.title || category.name}
        </Text>
        
        {showDescription && category.description && (
          <Text style={styles.horizontalDescription} numberOfLines={2}>
            {category.description}
          </Text>
        )}

        {category.count && (
          <Text style={styles.horizontalCount}>
            {category.count} {category.count === 1 ? 'item' : 'items'}
          </Text>
        )}
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.gray} />
    </TouchableOpacity>
  );
}

// Grid category card variant for featured categories
export function FeaturedCategoryCard({
  category,
  onPress,
  style,
}) {
  return (
    <TouchableOpacity
      style={[styles.featuredContainer, style]}
      onPress={() => onPress && onPress(category)}
      activeOpacity={0.7}
    >
      <View style={styles.featuredBackground}>
        <View style={[
          styles.featuredIconContainer,
          { backgroundColor: category.color || colors.primary }
        ]}>
          <Ionicons
            name={category.icon || 'apps'}
            size={48}
            color={colors.white}
          />
        </View>
      </View>

      <View style={styles.featuredContent}>
        <Text style={styles.featuredTitle} numberOfLines={1}>
          {category.title || category.name}
        </Text>
        
        {category.description && (
          <Text style={styles.featuredDescription} numberOfLines={2}>
            {category.description}
          </Text>
        )}

        <TouchableOpacity style={styles.featuredButton}>
          <Text style={styles.featuredButtonText}>Explore</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.white} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: 'relative',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 18,
  },
  description: {
    fontSize: 11,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: 4,
  },
  countContainer: {
    marginTop: 4,
  },
  count: {
    fontSize: 10,
    color: colors.gray,
    textAlign: 'center',
  },
  newBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.success,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: 'bold',
  },
  popularBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: colors.warning,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Horizontal variant styles
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  horizontalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  horizontalContent: {
    flex: 1,
  },
  horizontalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  horizontalDescription: {
    fontSize: 12,
    color: colors.gray,
    lineHeight: 16,
    marginBottom: 4,
  },
  horizontalCount: {
    fontSize: 11,
    color: colors.gray,
  },

  // Featured variant styles
  featuredContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  featuredBackground: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
  },
  featuredIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredContent: {
    padding: 16,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  featuredDescription: {
    fontSize: 14,
    color: colors.gray,
    lineHeight: 20,
    marginBottom: 12,
  },
  featuredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  featuredButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
});
