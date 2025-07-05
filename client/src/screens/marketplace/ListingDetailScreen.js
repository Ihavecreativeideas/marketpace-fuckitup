import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  Dimensions,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';
import { useListing, useAddToCart, useCreateOffer } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { formatPrice, formatDate } from '../../utils/helpers';
import Header from '../../components/common/Header';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const { width } = Dimensions.get('window');

export default function ListingDetailScreen({ route, navigation }) {
  const { listingId } = route.params;
  const { user } = useAuth();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [offerAmount, setOfferAmount] = useState('');

  const { data: listing, isLoading, error } = useListing(listingId);
  const addToCartMutation = useAddToCart();
  const createOfferMutation = useCreateOffer();

  const handleAddToCart = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to add items to cart');
      return;
    }

    try {
      await addToCartMutation.mutateAsync({
        listingId,
        quantity,
      });
      Alert.alert('Success', 'Item added to cart!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to make a purchase');
      return;
    }

    navigation.navigate('Checkout', {
      items: [{ listing, quantity }],
      totalAmount: listing.price * quantity,
    });
  };

  const handleMakeOffer = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to make an offer');
      return;
    }

    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      Alert.alert('Invalid Offer', 'Please enter a valid offer amount');
      return;
    }

    try {
      await createOfferMutation.mutateAsync({
        listingId,
        sellerId: listing.userId,
        offerAmount: parseFloat(offerAmount),
      });
      Alert.alert('Success', 'Offer sent to seller!');
      setOfferAmount('');
    } catch (error) {
      Alert.alert('Error', 'Failed to send offer');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this item on MarketPace: ${listing.title} - ${formatPrice(listing.price)}`,
        title: listing.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleContactSeller = () => {
    Alert.alert(
      'Contact Seller',
      'This feature will be available soon. You can message the seller directly.',
      [{ text: 'OK' }]
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage 
        title="Unable to load listing"
        message={error.message}
        onRetry={() => navigation.goBack()}
      />
    );
  }

  if (!listing) {
    return (
      <ErrorMessage 
        title="Listing not found"
        message="This listing may have been removed or is no longer available"
        onRetry={() => navigation.goBack()}
      />
    );
  }

  const images = listing.images || [];
  const defaultImage = 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Listing Details"
        showBackButton
        navigation={navigation}
        rightIcon="share-outline"
        onRightPress={handleShare}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setSelectedImageIndex(index);
            }}
          >
            {images.length > 0 ? (
              images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ))
            ) : (
              <Image
                source={{ uri: defaultImage }}
                style={styles.image}
                resizeMode="cover"
              />
            )}
          </ScrollView>
          
          {/* Image Indicators */}
          {images.length > 1 && (
            <View style={styles.imageIndicators}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    selectedImageIndex === index && styles.activeIndicator
                  ]}
                />
              ))}
            </View>
          )}

          {/* Badges */}
          <View style={styles.badges}>
            {listing.isRental && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>RENTAL</Text>
              </View>
            )}
            {listing.condition && (
              <View style={[styles.badge, styles.conditionBadge]}>
                <Text style={styles.badgeText}>
                  {listing.condition.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Listing Info */}
        <View style={styles.infoContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{listing.title}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>
                {formatPrice(listing.price)}
                {listing.isRental && (
                  <Text style={styles.rentalPeriod}>
                    {' '}/ {listing.rentalPeriod}
                  </Text>
                )}
              </Text>
              {listing.isNegotiable && (
                <Text style={styles.negotiable}>Negotiable</Text>
              )}
            </View>
          </View>

          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={20} color={Colors.textTertiary} />
            <Text style={styles.location}>{listing.location}</Text>
          </View>

          <View style={styles.metaInfo}>
            <Text style={styles.metaText}>
              Posted {formatDate(listing.createdAt)}
            </Text>
            <Text style={styles.metaText}>
              Category: {listing.category}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {listing.description || 'No description provided.'}
          </Text>
        </View>

        {/* Delivery Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Options</Text>
          <View style={styles.deliveryOptions}>
            {listing.deliveryOptions?.includes('pickup') && (
              <View style={styles.deliveryOption}>
                <Ionicons name="location" size={20} color={Colors.primary} />
                <Text style={styles.deliveryText}>Self Pickup</Text>
              </View>
            )}
            {listing.deliveryOptions?.includes('delivery') && (
              <View style={styles.deliveryOption}>
                <Ionicons name="car" size={20} color={Colors.primary} />
                <Text style={styles.deliveryText}>Delivery Available</Text>
              </View>
            )}
          </View>
        </View>

        {/* Quantity Selector */}
        {!listing.isRental && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Ionicons name="remove" size={20} color={Colors.primary} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Ionicons name="add" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Make Offer */}
        {listing.isNegotiable && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Make an Offer</Text>
            <View style={styles.offerContainer}>
              <View style={styles.offerInput}>
                <Text style={styles.dollarSign}>$</Text>
                <Text
                  style={styles.offerAmount}
                  onChangeText={setOfferAmount}
                  value={offerAmount}
                  placeholder="Enter offer amount"
                  keyboardType="numeric"
                />
              </View>
              <TouchableOpacity
                style={styles.offerButton}
                onPress={handleMakeOffer}
                disabled={createOfferMutation.isLoading}
              >
                <Text style={styles.offerButtonText}>
                  {createOfferMutation.isLoading ? 'Sending...' : 'Send Offer'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Seller Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seller</Text>
          <View style={styles.sellerInfo}>
            <View style={styles.sellerAvatar}>
              <Text style={styles.sellerInitials}>
                {listing.user?.firstName?.[0] || 'U'}
              </Text>
            </View>
            <View style={styles.sellerDetails}>
              <Text style={styles.sellerName}>
                {listing.user?.firstName || 'Unknown User'}
              </Text>
              <Text style={styles.sellerMeta}>
                Member since {formatDate(listing.user?.createdAt)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={handleContactSeller}
            >
              <Ionicons name="chatbubble-outline" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
          disabled={addToCartMutation.isLoading}
        >
          <Ionicons name="bag-add" size={20} color={Colors.primary} />
          <Text style={styles.addToCartText}>
            {addToCartMutation.isLoading ? 'Adding...' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.buyNowButton}
          onPress={handleBuyNow}
        >
          <Text style={styles.buyNowText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    height: 300,
    position: 'relative',
  },
  image: {
    width: width,
    height: 300,
    backgroundColor: Colors.lightGray,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: Spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white + '50',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: Colors.white,
  },
  badges: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    flexDirection: 'row',
  },
  badge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.borderRadius.sm,
    marginRight: Spacing.sm,
  },
  conditionBadge: {
    backgroundColor: Colors.primary,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  header: {
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    ...Typography.h2,
    color: Colors.primary,
    fontWeight: '700',
  },
  rentalPeriod: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  negotiable: {
    ...Typography.caption,
    color: Colors.success,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  location: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  section: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  deliveryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  deliveryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  deliveryText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  quantityButton: {
    backgroundColor: Colors.lightGray,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginHorizontal: Spacing.lg,
    minWidth: 30,
    textAlign: 'center',
  },
  offerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: Spacing.borderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.md,
  },
  dollarSign: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginRight: Spacing.xs,
  },
  offerAmount: {
    ...Typography.body,
    color: Colors.textPrimary,
    flex: 1,
  },
  offerButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
  },
  offerButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  sellerInitials: {
    ...Typography.h3,
    color: Colors.white,
    fontWeight: '700',
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  sellerMeta: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  contactButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomActions: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginRight: Spacing.sm,
  },
  addToCartText: {
    ...Typography.button,
    color: Colors.primary,
    marginLeft: Spacing.sm,
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.borderRadius.md,
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  buyNowText: {
    ...Typography.button,
    color: Colors.white,
  },
});
