import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface CampaignStats {
  towns: number;
  shops: number;
  entertainers: number;
  services: number;
  members: number;
}

export const LandingPage: React.FC = () => {
  const [stats, setStats] = useState<CampaignStats>({
    towns: 0,
    shops: 0,
    entertainers: 0,
    services: 0,
    members: 0
  });

  useEffect(() => {
    // Simulate loading campaign stats
    const timer = setTimeout(() => {
      setStats({
        towns: 12,
        shops: 247,
        entertainers: 89,
        services: 156,
        members: 1834
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const coreReasons = [
    {
      icon: '🏘️',
      title: 'Community First',
      description: 'Keep money circulating in your neighborhood instead of flowing to distant corporations'
    },
    {
      icon: '💰',
      title: 'Fair Economics',
      description: 'Transparent 5% fees, no hidden charges, 100% of tips go directly to drivers'
    },
    {
      icon: '🚚',
      title: 'Local Delivery',
      description: 'Neighbor-to-neighbor delivery system creating jobs and building connections'
    },
    {
      icon: '🎯',
      title: 'Everything Local',
      description: 'Buy, sell, rent, find services, book entertainment - all in one community platform'
    }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.heroSection}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.heroContent}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>MP</Text>
          </View>
          <Text style={styles.heroTitle}>MarketPlace</Text>
          <Text style={styles.heroTagline}>Pick Up the Pace in Your Community</Text>
          <Text style={styles.heroSubtitle}>Delivering Opportunities — Not Just Packages</Text>
        </View>
      </LinearGradient>

      {/* Mission Statement */}
      <View style={styles.missionSection}>
        <Text style={styles.missionTitle}>Our Mission</Text>
        <Text style={styles.missionText}>
          "Big tech platforms have taught us to rely on strangers and algorithms. MarketPlace reminds us what happens when we invest in each other."
        </Text>
        <Text style={styles.missionDescription}>
          We're building a new economic engine for local communities - one that prioritizes neighborhood empowerment over corporate profit, local ownership over distant shareholders, and community connections over algorithmic manipulation.
        </Text>
      </View>

      {/* Campaign Tracker */}
      <View style={styles.trackerSection}>
        <Text style={styles.trackerTitle}>🚀 Campaign Progress</Text>
        <Text style={styles.trackerSubtitle}>Growing Community by Community</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.towns}</Text>
            <Text style={styles.statLabel}>Towns</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.shops}</Text>
            <Text style={styles.statLabel}>Shops</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.entertainers}</Text>
            <Text style={styles.statLabel}>Entertainers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.services}</Text>
            <Text style={styles.statLabel}>Services</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.members}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
        </View>
      </View>

      {/* Early Member Benefits */}
      <LinearGradient
        colors={['#ff6b6b', '#ffa726']}
        style={styles.benefitsSection}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.benefitsTitle}>🎁 Early Member Exclusive</Text>
        <Text style={styles.benefitsSubtitle}>Join the Campaign, Get Lifetime Benefits</Text>
        <View style={styles.benefitsContent}>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>∞</Text>
            <Text style={styles.benefitText}>Lifetime Pro Access</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🏆</Text>
            <Text style={styles.benefitText}>Early Supporter Badge</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>⭐</Text>
            <Text style={styles.benefitText}>Featured Tab Priority</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🎯</Text>
            <Text style={styles.benefitText}>Never Pay Subscription</Text>
          </View>
        </View>
        <Text style={styles.benefitsFooter}>
          Campaign members who join during our city-by-city rollout will never pay the $3.99/month Pro subscription fee. Lock in your lifetime access now!
        </Text>
      </LinearGradient>

      {/* Core Reasons to Join */}
      <View style={styles.reasonsSection}>
        <Text style={styles.reasonsTitle}>Why Join MarketPlace?</Text>
        <Text style={styles.reasonsSubtitle}>Four Core Reasons to Be Part of the Movement</Text>
        
        {coreReasons.map((reason, index) => (
          <View key={index} style={styles.reasonCard}>
            <View style={styles.reasonHeader}>
              <Text style={styles.reasonIcon}>{reason.icon}</Text>
              <Text style={styles.reasonTitle}>{reason.title}</Text>
            </View>
            <Text style={styles.reasonDescription}>{reason.description}</Text>
          </View>
        ))}
      </View>

      {/* Call to Action */}
      <View style={styles.ctaSection}>
        <TouchableOpacity style={styles.signUpButton}>
          <LinearGradient
            colors={['#4CAF50', '#45a049']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.buttonText}>Join the Campaign</Text>
            <Text style={styles.buttonSubtext}>Get Lifetime Pro Access</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginText}>Already a Member? Log In</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          MarketPlace isn't just another app — it's a new economic engine for local communities.
        </Text>
        <Text style={styles.footerSubtext}>
          Built by communities, for communities. No venture capital. No data harvesting. No algorithmic manipulation.
        </Text>
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
  heroSection: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  heroTagline: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  missionSection: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  missionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  missionText: {
    fontSize: 16,
    color: '#555',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  missionDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  trackerSection: {
    padding: 24,
    backgroundColor: '#fff',
    marginVertical: 12,
  },
  trackerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  trackerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    minWidth: width * 0.18,
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  benefitsSection: {
    margin: 20,
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  benefitsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  benefitsSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  benefitsContent: {
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 12,
    color: '#fff',
    width: 24,
    textAlign: 'center',
  },
  benefitText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  benefitsFooter: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  reasonsSection: {
    padding: 24,
    backgroundColor: '#fff',
    marginVertical: 12,
  },
  reasonsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  reasonsSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  reasonCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reasonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  reasonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  reasonDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  ctaSection: {
    padding: 24,
    alignItems: 'center',
  },
  signUpButton: {
    width: '100%',
    marginBottom: 16,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  loginButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  loginText: {
    fontSize: 16,
    color: '#667eea',
    textAlign: 'center',
  },
  footer: {
    padding: 24,
    backgroundColor: '#fff',
    marginTop: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 40,
  },
});