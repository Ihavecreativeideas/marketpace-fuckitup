import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SimpleHome() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to MarketPace</Text>
        <Text style={styles.subtitle}>Your local marketplace and delivery service</Text>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <View style={styles.actionCard}>
            <Ionicons name="add-circle" size={32} color="#007AFF" />
            <Text style={styles.actionText}>Create Listing</Text>
          </View>
          <View style={styles.actionCard}>
            <Ionicons name="search" size={32} color="#007AFF" />
            <Text style={styles.actionText}>Browse Items</Text>
          </View>
          <View style={styles.actionCard}>
            <Ionicons name="cart" size={32} color="#007AFF" />
            <Text style={styles.actionText}>Your Cart</Text>
          </View>
          <View style={styles.actionCard}>
            <Ionicons name="car" size={32} color="#007AFF" />
            <Text style={styles.actionText}>Delivery</Text>
          </View>
        </View>
      </View>

      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.placeholder}>
          <Ionicons name="time" size={48} color="#ccc" />
          <Text style={styles.placeholderText}>No recent activity</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  recentSection: {
    padding: 20,
    marginBottom: 100, // Space for floating nav
  },
  placeholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
});