import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';
import { formatPrice, truncateText } from '../../utils/helpers';

export default function ListingCard({ 
  listing, 
  onPress, 
  onFavorite, 
  isFavorite = false,
  style = {}
}) {
  const defaultImage = 'https://via.placeholder.com/300x200?text=No+Image';
  const imageUrl = listing.images?.length > 0 ? listing.images[0] : defaultImage;

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={() => onPress(listing)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Favorite button */}
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => onFavorite && onFavorite(listing)}
        >
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={20} 
            color={isFavorite ? Colors.error : Colors.white} 
          />
        </TouchableOpacity>

        {/* Rental badge */}
        {listing.isRental && (
          <View style={styles.rentalBadge}>
            <Text style={styles.rentalText}>RENTAL</Text>
          </View>
        )}

        {/* Condition badge */}
        {listing.condition && (
          <View style={styles.conditionBadge}>
            <Text style={styles.conditionText}>
              {listing.condition.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          {truncateText(listing.title, 40)}
        </Text>
        
        <Text style={styles.price}>
          {formatPrice(listing.price)}
          {listing.isRental && (
            <Text style={styles.rentalPeriod}>
              {' '}/ {listing.rentalPeriod}
            </Text>
          )}
        </Text>

        <View style={styles.footer}>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color={Colors.textTertiary} />
            <Text style={styles.location}>
              {truncateText(listing.location, 20)}
            </Text>
          </View>

          {listing.isNegotiable && (
            <View style={styles.negotiableBadge}>
              <Text style={styles.negotiableText}>Negotiable</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: Spacing.borderRadius.lg,
    marginBottom: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    borderTopLeftRadius: Spacing.borderRadius.lg,
    borderTopRightRadius: Spacing.borderRadius.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.lightGray,
  },
  favoriteButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: Spacing.borderRadius.round,
    padding: Spacing.sm,
  },
  rentalBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.borderRadius.sm,
  },
  rentalText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  conditionBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.borderRadius.sm,
  },
  conditionText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '500',
  },
  content: {
    padding: Spacing.md,
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  price: {
    ...Typography.h2,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  rentalPeriod: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  location: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginLeft: Spacing.xs,
  },
  negotiableBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.borderRadius.sm,
  },
  negotiableText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
});
