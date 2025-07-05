import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../utils/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // Account for margins and spacing

export default function ListingCard({
  listing,
  onPress,
  onFavorite,
  showFavorite = false,
  style,
  imageStyle,
}) {
  const handleFavoritePress = (e) => {
    e.stopPropagation();
    if (onFavorite) {
      onFavorite(listing.id);
    }
  };

  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `$${price.toFixed(2)}`;
    }
    return price || 'Free';
  };

  const getConditionColor = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'new':
        return colors.success;
      case 'like_new':
        return colors.primary;
      case 'good':
        return colors.warning;
      case 'fair':
        return colors.info;
      case 'poor':
        return colors.error;
      default:
        return colors.gray;
    }
  };

  const formatCondition = (condition) => {
    if (!condition) return '';
    return condition.replace('_', ' ').toUpperCase();
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress && onPress(listing)}
      activeOpacity={0.7}
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: listing.images?.[0] || listing.image || 'https://via.placeholder.com/200x150/CCCCCC/FFFFFF?text=No+Image'
          }}
          style={[styles.image, imageStyle]}
          resizeMode="cover"
        />
        
        {/* Favorite Button */}
        {showFavorite && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
          >
            <Ionicons
              name={listing.isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={listing.isFavorite ? colors.error : colors.white}
            />
          </TouchableOpacity>
        )}

        {/* Type Badge */}
        {listing.type && (
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor(listing.type) }]}>
            <Text style={styles.typeBadgeText}>{listing.type.toUpperCase()}</Text>
          </View>
        )}

        {/* Condition Badge */}
        {listing.condition && listing.type !== 'service' && (
          <View style={[styles.conditionBadge, { backgroundColor: getConditionColor(listing.condition) }]}>
            <Text style={styles.conditionBadgeText}>{formatCondition(listing.condition)}</Text>
          </View>
        )}
      </View>

      {/* Content Container */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {listing.title}
        </Text>

        {/* Price */}
        <Text style={styles.price}>
          {formatPrice(listing.price)}
          {listing.rentPrice && (
            <Text style={styles.rentPrice}> / {listing.rentPeriod}</Text>
          )}
        </Text>

        {/* Location */}
        {listing.location && (
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={12} color={colors.gray} />
            <Text style={styles.location} numberOfLines={1}>
              {listing.location}
            </Text>
          </View>
        )}

        {/* Seller Info */}
        {listing.seller && (
          <View style={styles.sellerContainer}>
            <Image
              source={{
                uri: listing.seller.profileImage || 'https://via.placeholder.com/20'
              }}
              style={styles.sellerImage}
            />
            <Text style={styles.sellerName} numberOfLines={1}>
              {listing.seller.name}
            </Text>
            {listing.seller.rating && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={10} color={colors.warning} />
                <Text style={styles.rating}>{listing.seller.rating}</Text>
              </View>
            )}
          </View>
        )}

        {/* Tags */}
        {listing.tags && listing.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {listing.tags.slice(0, 2).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {listing.tags.length > 2 && (
              <Text style={styles.moreTags}>+{listing.tags.length - 2}</Text>
            )}
          </View>
        )}

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.timeAgo}>
            {listing.timeAgo || listing.createdAt}
          </Text>
          {listing.views && (
            <View style={styles.viewsContainer}>
              <Ionicons name="eye-outline" size={12} color={colors.gray} />
              <Text style={styles.views}>{listing.views}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Helper function to get type color
function getTypeColor(type) {
  switch (type?.toLowerCase()) {
    case 'shop':
      return colors.primary;
    case 'service':
      return colors.success;
    case 'event':
      return colors.warning;
    case 'rental':
      return colors.info;
    default:
      return colors.gray;
  }
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  imageContainer: {
    position: 'relative',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 120,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: 'bold',
  },
  conditionBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  conditionBadgeText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: 'bold',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    lineHeight: 18,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 6,
  },
  rentPrice: {
    fontSize: 12,
    fontWeight: 'normal',
    color: colors.gray,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  location: {
    fontSize: 11,
    color: colors.gray,
    marginLeft: 2,
    flex: 1,
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sellerImage: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 4,
  },
  sellerName: {
    fontSize: 11,
    color: colors.gray,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  rating: {
    fontSize: 10,
    color: colors.gray,
    marginLeft: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  tag: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 2,
  },
  tagText: {
    fontSize: 9,
    color: colors.gray,
  },
  moreTags: {
    fontSize: 9,
    color: colors.gray,
    alignSelf: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeAgo: {
    fontSize: 10,
    color: colors.gray,
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  views: {
    fontSize: 10,
    color: colors.gray,
    marginLeft: 2,
  },
});
