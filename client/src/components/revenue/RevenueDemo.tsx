import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface DemoStats {
  productSaleFee: number;
  serviceFee: number;
  walletBonus: number;
  driverPayout: number;
  sponsorshipTotal: number;
  sponsorCount: number;
}

export const RevenueDemo: React.FC = () => {
  const [stats, setStats] = useState<DemoStats>({
    productSaleFee: 0,
    serviceFee: 0,
    walletBonus: 0,
    driverPayout: 0,
    sponsorshipTotal: 0,
    sponsorCount: 0
  });
  const [sponsorships, setSponsorships] = useState<any[]>([]);

  useEffect(() => {
    calculateDemoStats();
    fetchSponsorships();
  }, []);

  const calculateDemoStats = () => {
    // Demo calculations based on the revenue logic
    const productSale = 100;
    const serviceSale = 200;
    const walletLoad = 50;
    const driverPickups = 3;
    const driverDropoffs = 3;
    const driverMiles = 15;
    const driverTips = 10;

    const productSaleFee = productSale * 0.05; // 5%
    const serviceFee = serviceSale * 0.05 + 2 + 1; // 5% + insurance + verification
    const walletBonus = walletLoad * 0.10; // 10% bonus
    const driverPayout = (driverPickups * 4) + (driverDropoffs * 2) + (driverMiles * 0.50) + driverTips;

    setStats({
      productSaleFee,
      serviceFee,
      walletBonus,
      driverPayout,
      sponsorshipTotal: 0,
      sponsorCount: 0
    });
  };

  const fetchSponsorships = async () => {
    try {
      const response = await fetch('/api/revenue/sponsorships/active');
      if (response.ok) {
        const data = await response.json();
        setSponsorships(data);
        
        const total = data.reduce((sum: number, sponsor: any) => sum + parseFloat(sponsor.amount), 0);
        setStats(prev => ({
          ...prev,
          sponsorshipTotal: total,
          sponsorCount: data.length
        }));
      }
    } catch (error) {
      console.error('Error fetching sponsorships:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const demoCalculations = [
    {
      title: 'Product Sale Fee (5%)',
      description: '$100 product sale',
      calculation: '$100 × 5% = $5.00',
      result: stats.productSaleFee,
      color: ['#667eea', '#764ba2']
    },
    {
      title: 'Service Fee (5% + Optional)',
      description: '$200 service + insurance + verification',
      calculation: '$200 × 5% + $2 + $1 = $13.00',
      result: stats.serviceFee,
      color: ['#f093fb', '#f5576c']
    },
    {
      title: 'Wallet Bonus (10%)',
      description: '$50 wallet load',
      calculation: '$50 × 10% = $5.00 bonus',
      result: stats.walletBonus,
      color: ['#4facfe', '#00f2fe']
    },
    {
      title: 'Driver Payout',
      description: '3 pickups, 3 dropoffs, 15 miles, $10 tips',
      calculation: '(3×$4) + (3×$2) + (15×$0.50) + $10 = $35.50',
      result: stats.driverPayout,
      color: ['#43e97b', '#38f9d7']
    }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>MarketPlace Revenue System</Text>
        <Text style={styles.tagline}>Pick Up the Pace in Your Community</Text>
        <Text style={styles.subtitle}>
          Delivering Opportunities — Not Just Packages
        </Text>
        <Text style={styles.mission}>
          "Big tech platforms have taught us to rely on strangers and algorithms. MarketPlace reminds us what happens when we invest in each other."
        </Text>
      </View>

      {/* Use Case Scenarios */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Real Community Stories</Text>
        <Text style={styles.sectionSubtitle}>
          See how MarketPlace empowers local entrepreneurs and families
        </Text>
        
        <View style={styles.scenarioCard}>
          <View style={styles.scenarioHeader}>
            <Text style={styles.scenarioIcon}>🎵</Text>
            <Text style={styles.scenarioTitle}>Local Musician Success</Text>
          </View>
          <Text style={styles.scenarioText}>
            Sarah promotes her upcoming jazz performance on the Community feed. Through "The Hub," she books 3 private events earning $450 total. MarketPlace fee: $22.50 (5%).
          </Text>
          <Text style={styles.scenarioResult}>Sarah keeps $427.50 while supporting local music culture</Text>
        </View>

        <View style={styles.scenarioCard}>
          <View style={styles.scenarioHeader}>
            <Text style={styles.scenarioIcon}>👶</Text>
            <Text style={styles.scenarioTitle}>Parent's Smart Solution</Text>
          </View>
          <Text style={styles.scenarioText}>
            Maria sells her toddler's stroller for $80 and rents out a crib for $25/month. Local delivery handles everything. Total MarketPlace fees: $5.25.
          </Text>
          <Text style={styles.scenarioResult}>Maria earns $99.75 while helping other families</Text>
        </View>

        <View style={styles.scenarioCard}>
          <View style={styles.scenarioHeader}>
            <Text style={styles.scenarioIcon}>🛍️</Text>
            <Text style={styles.scenarioTitle}>Local Shop Integration</Text>
          </View>
          <Text style={styles.scenarioText}>
            "Corner Crafts" integrates their Etsy store with MarketPlace. 6 orders ($180 total) delivered in one optimized route. MarketPlace fee: $9.00.
          </Text>
          <Text style={styles.scenarioResult}>Shop saves on shipping while serving neighbors directly</Text>
        </View>

        <View style={styles.scenarioCard}>
          <View style={styles.scenarioHeader}>
            <Text style={styles.scenarioIcon}>🔧</Text>
            <Text style={styles.scenarioTitle}>Handyman's Double Income</Text>
          </View>
          <Text style={styles.scenarioText}>
            Mike finds 2 odd jobs ($150 total) and earns $45 delivering items on his route home. MarketPlace service fee: $8.50, driver pay: $45.
          </Text>
          <Text style={styles.scenarioResult}>Mike earns $186.50 total while strengthening his community</Text>
        </View>
      </View>

      {/* Live Demo Calculations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Live Fee Calculations</Text>
        
        {demoCalculations.map((item, index) => (
          <LinearGradient
            key={index}
            colors={item.color}
            style={styles.calculationCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.calculationHeader}>
              <Text style={styles.calculationTitle}>{item.title}</Text>
              <Text style={styles.calculationResult}>
                {formatCurrency(item.result)}
              </Text>
            </View>
            <Text style={styles.calculationDescription}>{item.description}</Text>
            <Text style={styles.calculationFormula}>{item.calculation}</Text>
          </LinearGradient>
        ))}
      </View>

      {/* Community Sponsors */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Live Community Sponsors</Text>
        <Text style={styles.sectionSubtitle}>
          {stats.sponsorCount} local businesses • {formatCurrency(stats.sponsorshipTotal)} total support
        </Text>
        
        {sponsorships.map((sponsor, index) => (
          <View key={index} style={styles.sponsorCard}>
            <View style={styles.sponsorHeader}>
              <Text style={styles.sponsorName}>{sponsor.businessName}</Text>
              <Text style={styles.sponsorAmount}>{formatCurrency(parseFloat(sponsor.amount))}</Text>
            </View>
            <Text style={styles.sponsorType}>
              Supporting: {sponsor.sponsorshipType.replace('_', ' ')}
            </Text>
            {sponsor.message && (
              <Text style={styles.sponsorMessage}>"{sponsor.message}"</Text>
            )}
          </View>
        ))}
      </View>

      {/* Revenue Model Principles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Ethical Principles</Text>
        
        <View style={styles.principleCard}>
          <View style={styles.principleItem}>
            <Text style={styles.principleIcon}>✅</Text>
            <View style={styles.principleContent}>
              <Text style={styles.principleTitle}>Transparent Fees</Text>
              <Text style={styles.principleText}>All fees clearly displayed upfront, no hidden charges</Text>
            </View>
          </View>

          <View style={styles.principleItem}>
            <Text style={styles.principleIcon}>🚫</Text>
            <View style={styles.principleContent}>
              <Text style={styles.principleTitle}>No Data Selling</Text>
              <Text style={styles.principleText}>Your data stays private, never sold to third parties</Text>
            </View>
          </View>

          <View style={styles.principleItem}>
            <Text style={styles.principleIcon}>🏘️</Text>
            <View style={styles.principleContent}>
              <Text style={styles.principleTitle}>Community First</Text>
              <Text style={styles.principleText}>Revenue supports local drivers and neighborhood growth</Text>
            </View>
          </View>

          <View style={styles.principleItem}>
            <Text style={styles.principleIcon}>⚖️</Text>
            <View style={styles.principleContent}>
              <Text style={styles.principleTitle}>Fair Algorithm</Text>
              <Text style={styles.principleText}>No pay-to-win or suppression of unpaid content</Text>
            </View>
          </View>

          <View style={styles.principleItem}>
            <Text style={styles.principleIcon}>💰</Text>
            <View style={styles.principleContent}>
              <Text style={styles.principleTitle}>Driver-Friendly</Text>
              <Text style={styles.principleText}>100% of tips go directly to drivers</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Launch Campaign */}
      <LinearGradient
        colors={['#ff6b6b', '#ffa726']}
        style={styles.campaignCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.campaignTitle}>🚀 Launch Campaign</Text>
        <Text style={styles.campaignSubtitle}>City-by-City Rollout</Text>
        <Text style={styles.campaignDescription}>
          We're launching city by city with a free campaign trial, giving early users lifetime Pro access. Our model scales like Uber, but with local ownership at the core.
        </Text>
        <View style={styles.campaignStats}>
          <View style={styles.campaignItem}>
            <Text style={styles.campaignNumber}>FREE</Text>
            <Text style={styles.campaignLabel}>Trial Period</Text>
          </View>
          <View style={styles.campaignItem}>
            <Text style={styles.campaignNumber}>LIFETIME</Text>
            <Text style={styles.campaignLabel}>Pro Access</Text>
          </View>
          <View style={styles.campaignItem}>
            <Text style={styles.campaignNumber}>LOCAL</Text>
            <Text style={styles.campaignLabel}>Ownership</Text>
          </View>
        </View>
        <Text style={styles.campaignFooter}>
          MarketPlace isn't just another app — it's a new economic engine for local communities.
        </Text>
      </LinearGradient>

      {/* Summary Stats */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.summaryCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.summaryTitle}>Revenue System Summary</Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>$3.99</Text>
            <Text style={styles.summaryLabel}>Pro Monthly</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>5%</Text>
            <Text style={styles.summaryLabel}>Transaction Fee</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>+10%</Text>
            <Text style={styles.summaryLabel}>Wallet Bonus</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>100%</Text>
            <Text style={styles.summaryLabel}>Tips to Drivers</Text>
          </View>
        </View>
        <Text style={styles.summaryFooter}>
          Built for community empowerment, not corporate profit
        </Text>
      </LinearGradient>

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
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
  },
  mission: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  section: {
    marginVertical: 12,
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
  calculationCard: {
    margin: 20,
    marginVertical: 8,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  calculationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calculationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  calculationResult: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  calculationDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  calculationFormula: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'monospace',
  },
  sponsorCard: {
    backgroundColor: '#fff',
    margin: 20,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sponsorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sponsorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  sponsorAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  sponsorType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  sponsorMessage: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
  },
  principleCard: {
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
  principleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  principleIcon: {
    fontSize: 18,
    marginRight: 12,
    marginTop: 2,
  },
  principleContent: {
    flex: 1,
  },
  principleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  principleText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  summaryCard: {
    margin: 20,
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  summaryFooter: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  scenarioCard: {
    backgroundColor: '#fff',
    margin: 20,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  scenarioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scenarioIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  scenarioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  scenarioText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  scenarioResult: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  campaignCard: {
    margin: 20,
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  campaignTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  campaignSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  campaignDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  campaignStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  campaignItem: {
    alignItems: 'center',
  },
  campaignNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  campaignLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  campaignFooter: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});