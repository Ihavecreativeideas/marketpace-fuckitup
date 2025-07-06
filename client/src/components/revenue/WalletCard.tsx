import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface WalletData {
  balance: number;
  totalLoaded: number;
  totalSpent: number;
  bonusEarned: number;
}

interface WalletTransaction {
  id: number;
  type: string;
  amount: string;
  description: string;
  balanceAfter: string;
  createdAt: string;
  status: string;
}

export const WalletCard: React.FC = () => {
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 0,
    totalLoaded: 0,
    totalSpent: 0,
    bonusEarned: 0
  });
  const [loadAmount, setLoadAmount] = useState('10');
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

  useEffect(() => {
    fetchWalletData();
    fetchTransactions();
  }, []);

  const fetchWalletData = async () => {
    try {
      const response = await fetch('/api/revenue/wallet/balance', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setWalletData(data);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/revenue/wallet/transactions?limit=10', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleLoadCredits = async () => {
    const amount = parseFloat(loadAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, this would integrate with Stripe
      const mockPaymentIntentId = `pi_mock_${Date.now()}`;
      
      const response = await fetch('/api/revenue/wallet/load', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          amount,
          stripePaymentIntentId: mockPaymentIntentId
        })
      });

      if (response.ok) {
        const result = await response.json();
        Alert.alert(
          'Success!', 
          result.message || `Loaded $${amount.toFixed(2)} + 10% bonus to your wallet`
        );
        setShowLoadModal(false);
        setLoadAmount('10');
        fetchWalletData();
        fetchTransactions();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.error || 'Failed to load credits');
      }
    } catch (error) {
      console.error('Error loading credits:', error);
      Alert.alert('Error', 'Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'load': return '💰';
      case 'spend': return '💸';
      case 'bonus': return '🎁';
      case 'refund': return '↩️';
      default: return '💳';
    }
  };

  return (
    <View style={styles.container}>
      {/* Wallet Balance Card */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.walletCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.walletTitle}>MarketPlace Wallet</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(walletData.balance)}</Text>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Loaded</Text>
            <Text style={styles.statValue}>{formatCurrency(walletData.totalLoaded)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Bonus Earned</Text>
            <Text style={styles.statValue}>{formatCurrency(walletData.bonusEarned)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Spent</Text>
            <Text style={styles.statValue}>{formatCurrency(walletData.totalSpent)}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.loadButton}
          onPress={() => setShowLoadModal(true)}
        >
          <Text style={styles.loadButtonText}>💰 Load Credits (+10% Bonus)</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Recent Transactions */}
      <View style={styles.transactionsSection}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {transactions.length === 0 ? (
          <Text style={styles.noTransactions}>No transactions yet</Text>
        ) : (
          transactions.slice(0, 5).map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <Text style={styles.transactionIcon}>
                  {getTransactionIcon(transaction.type)}
                </Text>
                <View>
                  <Text style={styles.transactionDescription}>
                    {transaction.description}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <View style={styles.transactionRight}>
                <Text style={[
                  styles.transactionAmount,
                  transaction.type === 'spend' ? styles.negative : styles.positive
                ]}>
                  {transaction.type === 'spend' ? '-' : '+'}
                  {formatCurrency(parseFloat(transaction.amount))}
                </Text>
                <Text style={styles.transactionBalance}>
                  Balance: {formatCurrency(parseFloat(transaction.balanceAfter))}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Load Credits Modal */}
      <Modal
        visible={showLoadModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLoadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Load Credits to Wallet</Text>
            <Text style={styles.modalSubtitle}>
              Get 10% bonus! ${loadAmount} becomes ${(parseFloat(loadAmount) * 1.1).toFixed(2)}
            </Text>
            
            <TextInput
              style={styles.amountInput}
              value={loadAmount}
              onChangeText={setLoadAmount}
              placeholder="Amount to load"
              keyboardType="numeric"
            />

            <View style={styles.quickAmounts}>
              {['10', '25', '50', '100'].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.quickAmountButton,
                    loadAmount === amount && styles.quickAmountSelected
                  ]}
                  onPress={() => setLoadAmount(amount)}
                >
                  <Text style={[
                    styles.quickAmountText,
                    loadAmount === amount && styles.quickAmountSelectedText
                  ]}>
                    ${amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLoadModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.loadModalButton]}
                onPress={handleLoadCredits}
                disabled={isLoading}
              >
                <Text style={styles.loadModalButtonText}>
                  {isLoading ? 'Processing...' : `Load $${loadAmount}`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  walletCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardHeader: {
    marginBottom: 20,
  },
  walletTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  transactionsSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  noTransactions: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    paddingVertical: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#F44336',
  },
  transactionBalance: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickAmountButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  quickAmountSelected: {
    backgroundColor: '#667eea',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  quickAmountSelectedText: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  loadModalButton: {
    backgroundColor: '#667eea',
  },
  loadModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});