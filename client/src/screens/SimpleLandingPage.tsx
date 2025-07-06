import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const SimpleLandingPage: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.heroSection}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>MP</Text>
        </View>
        <Text style={styles.heroTitle}>MarketPlace</Text>
        <Text style={styles.heroTagline}>Pick Up the Pace in Your Community</Text>
        <Text style={styles.heroSubtitle}>Delivering Opportunities — Not Just Packages</Text>
      </LinearGradient>

      {/* Mission */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.missionText}>
          "Big tech platforms have taught us to rely on strangers and algorithms. MarketPlace reminds us what happens when we invest in each other."
        </Text>
      </View>

      {/* Campaign Tracker */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 Campaign Progress</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Towns</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>247</Text>
            <Text style={styles.statLabel}>Shops</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>89</Text>
            <Text style={styles.statLabel}>Entertainers</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>156</Text>
            <Text style={styles.statLabel}>Services</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>1,834</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
        </View>
      </View>

      {/* Early Member Benefits */}
      <LinearGradient
        colors={['#ff6b6b', '#ffa726']}
        style={styles.benefitsSection}
      >
        <Text style={styles.benefitsTitle}>🎁 Early Member Exclusive</Text>
        <Text style={styles.benefitsSubtitle}>Join the Campaign, Get Lifetime Benefits</Text>
        <Text style={styles.benefitsText}>
          Campaign members who join during our city-by-city rollout will never pay the $3.99/month Pro subscription fee. Lock in your lifetime access now!
        </Text>
      </LinearGradient>

      {/* Core Reasons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why Join MarketPlace?</Text>
        
        <View style={styles.reasonCard}>
          <Text style={styles.reasonIcon}>🏘️</Text>
          <View style={styles.reasonContent}>
            <Text style={styles.reasonTitle}>Community First</Text>
            <Text style={styles.reasonDescription}>Keep money circulating in your neighborhood instead of flowing to distant corporations</Text>
          </View>
        </View>

        <View style={styles.reasonCard}>
          <Text style={styles.reasonIcon}>💰</Text>
          <View style={styles.reasonContent}>
            <Text style={styles.reasonTitle}>Fair Economics</Text>
            <Text style={styles.reasonDescription}>Transparent 5% fees, no hidden charges, 100% of tips go directly to drivers</Text>
          </View>
        </View>

        <View style={styles.reasonCard}>
          <Text style={styles.reasonIcon}>🚚</Text>
          <View style={styles.reasonContent}>
            <Text style={styles.reasonTitle}>Local Delivery</Text>
            <Text style={styles.reasonDescription}>Neighbor-to-neighbor delivery system creating jobs and building connections</Text>
          </View>
        </View>

        <View style={styles.reasonCard}>
          <Text style={styles.reasonIcon}>🎯</Text>
          <View style={styles.reasonContent}>
            <Text style={styles.reasonTitle}>Everything Local</Text>
            <Text style={styles.reasonDescription}>Buy, sell, rent, find services, book entertainment - all in one community platform</Text>
          </View>
        </View>
      </View>

      {/* Call to Action */}
      <View style={styles.ctaSection}>
        <TouchableOpacity style={styles.signUpButton}>
          <LinearGradient
            colors={['#4CAF50', '#45a049']}
            style={styles.buttonGradient}
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
      </View>
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
  logoContainer: {
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
  },
  section: {
    padding: 24,
    backgroundColor: '#fff',
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 22,
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
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    marginBottom: 16,
    minWidth: '18%',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  benefitsSection: {
    margin: 20,
    borderRadius: 16,
    padding: 24,
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
    marginBottom: 16,
  },
  benefitsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  reasonCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  reasonIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  reasonContent: {
    flex: 1,
  },
  reasonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
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
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 20,
  },
});