import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { WalletCard } from '../components/revenue/WalletCard';
import { SubscriptionCard } from '../components/revenue/SubscriptionCard';
import { LinearGradient } from 'expo-linear-gradient';

interface PromotionData {
  availableBoosts: number;
  totalSpent: number;
  activePromotions: Array<{
    id: number;
    type: string;
    amount: string;
    duration: number;
    status: string;
    endDate: string;
  }>;
}

interface SponsorshipData {
  businessName: string;
  amount: string;
  message: string;
  logoUrl?: string;
}

export const RevenueDashboard: React.FC = () => {
  const [promotions, setPromotions] = useState<PromotionData>({
    availableBoosts: 0,
    totalSpent: 0,
    activePromotions: []
  });
  const [sponsorships, setSponsorships] = useState<SponsorshipData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPromotions();
    fetchSponsorships();
  }, []);

  const fetchPromotions = async () => {
    // Mock data for now - would fetch from API
    setPromotions({
      availableBoosts: 3,
      totalSpent: 45.50,
      activePromotions: [
        {
          id: 1,
          type: 'boost_listing',
          amount: '5.00',
          duration: 3,
          status: 'active',
          endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    });
  };

  const fetchSponsorships = async () => {
    try {
      const response = await fetch('/api/revenue/sponsorships/active', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSponsorships(data);
      }
    } catch (error) {
      console.error('Error fetching sponsorships:', error);
    }
  };

  const handleBoostListing = () => {
    Alert.alert(
      'Boost Listing',
      'This feature allows you to promote your listings for better visibility. Amount ranges from $2-$10.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Learn More', onPress: () => {} }
      ]
    );
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Revenue Center</Text>
        <Text style={styles.headerSubtitle}>
          Manage your wallet, subscription, and promotions
        </Text>
      </View>

      {/* Wallet Section */}
      <WalletCard />

      {/* Subscription Section */}
      <SubscriptionCard />

      {/* Promotions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Promotions & Boosts</Text>
        
        <LinearGradient
          colors={['#ff9a9e', '#fecfef']}
          style={styles.promotionCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.promotionHeader}>
            <Text style={styles.promotionTitle}>Boost Your Listings</Text>
            <Text style={styles.promotionSubtitle}>
              Increase visibility and get more views
            </Text>
          </View>

          <View style={styles.promotionStats}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{promotions.availableBoosts}</Text>
              <Text style={styles.statLabel}>Available Boosts</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {formatCurrency(promotions.totalSpent)}
              </Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.boostButton}
            onPress={handleBoostListing}
          >
            <Text style={styles.boostButtonText}>🚀 Boost a Listing</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Active Promotions */}
        {promotions.activePromotions.length > 0 && (
          <View style={styles.activePromotions}>
            <Text style={styles.activePromotionsTitle}>Active Promotions</Text>
            {promotions.activePromotions.map((promo) => (
              <View key={promo.id} style={styles.promoItem}>
                <View style={styles.promoInfo}>
                  <Text style={styles.promoType}>
                    {promo.type.replace('_', ' ').toUpperCase()}
                  </Text>
                  <Text style={styles.promoDetails}>
                    {formatCurrency(promo.amount)} • {promo.duration} days
                  </Text>
                </View>
                <View style={styles.promoStatus}>
                  <Text style={styles.promoStatusText}>
                    Ends {new Date(promo.endDate).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Sponsorships Section */}
      {sponsorships.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Sponsors</Text>
          <Text style={styles.sectionSubtitle}>
            Local businesses supporting our community
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {sponsorships.map((sponsor, index) => (
              <View key={index} style={styles.sponsorCard}>
                <Text style={styles.sponsorName}>{sponsor.businessName}</Text>
                <Text style={styles.sponsorAmount}>
                  {formatCurrency(sponsor.amount)}
                </Text>
                {sponsor.message && (
                  <Text style={styles.sponsorMessage}>"{sponsor.message}"</Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Fee Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fee Structure</Text>
        
        <View style={styles.feeCard}>
          <View style={styles.feeItem}>
            <Text style={styles.feeLabel}>Product Sales</Text>
            <Text style={styles.feeValue}>5%</Text>
          </View>
          <View style={styles.feeItem}>
            <Text style={styles.feeLabel}>Services & Rentals</Text>
            <Text style={styles.feeValue}>5% + optional fees</Text>
          </View>
          <View style={styles.feeItem}>
            <Text style={styles.feeLabel}>Damage Insurance</Text>
            <Text style={styles.feeValue}>$2.00 (optional)</Text>
          </View>
          <View style={styles.feeItem}>
            <Text style={styles.feeLabel}>Verification</Text>
            <Text style={styles.feeValue}>$1.00 (optional)</Text>
          </View>
          <View style={styles.feeItem}>
            <Text style={styles.feeLabel}>Wallet Bonus</Text>
            <Text style={styles.feeValue}>+10% on loads</Text>
          </View>
        </View>

        <View style={styles.ethicalNote}>
          <Text style={styles.ethicalTitle}>💚 Ethical Revenue Model</Text>
          <Text style={styles.ethicalText}>
            All fees support local drivers, community growth, and platform maintenance. 
            No hidden charges, no data selling, no algorithmic suppression.
          </Text>
        </View>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  promotionCard: {
    margin: 20,
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  promotionHeader: {
    marginBottom: 20,
  },
  promotionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  promotionSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  promotionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  boostButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  boostButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  activePromotions: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activePromotionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  promoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  promoInfo: {
    flex: 1,
  },
  promoType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  promoDetails: {
    fontSize: 12,
    color: '#666',
  },
  promoStatus: {
    alignItems: 'flex-end',
  },
  promoStatusText: {
    fontSize: 12,
    color: '#666',
  },
  sponsorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    marginLeft: 20,
    minWidth: 200,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sponsorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sponsorAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 8,
  },
  sponsorMessage: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  feeCard: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  feeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  feeLabel: {
    fontSize: 14,
    color: '#333',
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  ethicalNote: {
    backgroundColor: '#e8f5e8',
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
  },
  ethicalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  ethicalText: {
    fontSize: 14,
    color: '#2e7d32',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});