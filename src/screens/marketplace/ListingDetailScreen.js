import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/common/Header';
import { colors } from '../../utils/colors';
import { api } from '../../services/api';

export default function ListingDetailScreen({ navigation, route }) {
  const { listingId } = route.params;
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    loadListing();
  }, [listingId]);

  const loadListing = async () => {
    try {
      const response = await api.get(`/marketplace/listings/${listingId}`);
      setListing(response.data);
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      console.error('Error loading listing:', error);
      Alert.alert('Error', 'Failed to load listing details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to add items to cart');
      return;
    }

    addToCart({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      image: listing.images[0],
      sellerId: listing.sellerId,
      quantity: quantity,
    });

    Alert.alert('Success', 'Item added to cart!');
  };

  const handleBuyNow = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to purchase');
      return;
    }

    navigation.navigate('Checkout', { 
      items: [{
        id: listing.id,
        title: listing.title,
        price: listing.price,
        image: listing.images[0],
        sellerId: listing.sellerId,
        quantity: quantity,
      }]
    });
  };

  const handleCounterOffer = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to make an offer');
      return;
    }

    navigation.navigate('CounterOffer', { listingId: listing.id });
  };

  const handleContactSeller = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to contact seller');
      return;
    }

    navigation.navigate('Chat', { sellerId: listing.sellerId });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this ${listing.title} on MarketPace for $${listing.price}!`,
        url: `https://marketpace.app/listing/${listing.id}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const response = await api.post(`/marketplace/listings/${listingId}/favorite`);
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleReportListing = () => {
    Alert.alert(
      'Report Listing',
      'Why are you reporting this listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Inappropriate Content', onPress: () => reportListing('inappropriate') },
        { text: 'Spam', onPress: () => reportListing('spam') },
        { text: 'Scam', onPress: () => reportListing('scam') },
        { text: 'Other', onPress: () => reportListing('other') },
      ]
    );
  };

  const reportListing = async (reason) => {
    try {
      await api.post(`/marketplace/listings/${listingId}/report`, { reason });
      Alert.alert('Thank you', 'Your report has been submitted for review.');
    } catch (error) {
      console.error('Error reporting listing:', error);
      Alert.alert('Error', 'Failed to submit report');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          title="Loading..."
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <Text>Loading listing details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          title="Not Found"
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <Text>Listing not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={listing.title}
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleShare} style={styles.headerAction}>
              <Ionicons name="share-outline" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleToggleFavorite} style={styles.headerAction}>
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorite ? colors.error : colors.text} 
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleReportListing} style={styles.headerAction}>
              <Ionicons name="flag-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView style={styles.content}>
        {/* Images */}
        <ScrollView horizontal pagingEnabled style={styles.imageContainer}>
          {listing.images?.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              style={styles.image}
            />
          ))}
        </ScrollView>

        {/* Basic Info */}
        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{listing.title}</Text>
            <Text style={styles.price}>${listing.price}</Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.categoryTag}>
              <Ionicons name="pricetag" size={16} color={colors.primary} />
              <Text style={styles.categoryText}>{listing.category}</Text>
            </View>
            <Text style={styles.date}>{listing.createdAt}</Text>
          </View>

          <Text style={styles.description}>{listing.description}</Text>

          {/* Seller Info */}
          <View style={styles.sellerContainer}>
            <Image
              source={{ uri: listing.seller?.profileImage || 'https://via.placeholder.com/50' }}
              style={styles.sellerImage}
            />
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{listing.seller?.name}</Text>
              <View style={styles.sellerRating}>
                <Ionicons name="star" size={16} color={colors.warning} />
                <Text style={styles.ratingText}>{listing.seller?.rating || 'New'}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={handleContactSeller}
            >
              <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
              <Text style={styles.contactButtonText}>Contact</Text>
            </TouchableOpacity>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Ionicons name="remove" size={20} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Ionicons name="add" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Location */}
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={20} color={colors.gray} />
            <Text style={styles.locationText}>{listing.location}</Text>
          </View>

          {/* Delivery Options */}
          <View style={styles.deliveryContainer}>
            <Text style={styles.deliveryTitle}>Delivery Options:</Text>
            <View style={styles.deliveryOptions}>
              <View style={styles.deliveryOption}>
                <Ionicons name="car" size={20} color={colors.primary} />
                <Text style={styles.deliveryText}>MarketPace Delivery</Text>
              </View>
              <View style={styles.deliveryOption}>
                <Ionicons name="person" size={20} color={colors.success} />
                <Text style={styles.deliveryText}>Self Pickup</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.counterOfferButton}
          onPress={handleCounterOffer}
        >
          <Ionicons name="swap-horizontal" size={20} color={colors.info} />
          <Text style={styles.counterOfferText}>Counter Offer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
        >
          <Ionicons name="cart-outline" size={20} color={colors.white} />
          <Text style={styles.addToCartText}>Add to Cart</Text>
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
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAction: {
    marginLeft: 16,
  },
  imageContainer: {
    height: 300,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 16,
    backgroundColor: colors.white,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    color: colors.gray,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 20,
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.lightGray,
    marginBottom: 16,
  },
  sellerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  sellerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: colors.gray,
    marginLeft: 4,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  contactButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 16,
    color: colors.text,
    marginRight: 16,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
  },
  quantityButton: {
    padding: 8,
    backgroundColor: colors.lightGray,
  },
  quantityText: {
    fontSize: 16,
    color: colors.text,
    paddingHorizontal: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    color: colors.gray,
    marginLeft: 8,
  },
  deliveryContainer: {
    marginBottom: 16,
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  deliveryOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  deliveryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deliveryText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  counterOfferButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.info + '20',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  counterOfferText: {
    fontSize: 14,
    color: colors.info,
    marginLeft: 4,
    fontWeight: '500',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    flex: 1,
    justifyContent: 'center',
  },
  addToCartText: {
    fontSize: 14,
    color: colors.white,
    marginLeft: 4,
    fontWeight: '600',
  },
  buyNowButton: {
    backgroundColor: colors.success,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyNowText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
