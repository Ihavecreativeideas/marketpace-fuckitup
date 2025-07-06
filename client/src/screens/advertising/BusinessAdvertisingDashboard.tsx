import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Campaign {
  id: number;
  name: string;
  objective: string;
  status: string;
  dailyBudget: number;
  spent: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  targeting: any;
}

interface AudienceSegment {
  id: number;
  name: string;
  userCount: number;
  type: string;
}

const BusinessAdvertisingDashboard: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [audiences, setAudiences] = useState<AudienceSegment[]>([]);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showCreateAudience, setShowCreateAudience] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Campaign creation form state
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    objective: 'awareness',
    dailyBudget: '',
    targeting: {
      age: { min: 18, max: 65 },
      interests: [],
      location: ''
    }
  });

  // Audience creation form state
  const [audienceForm, setAudienceForm] = useState({
    name: '',
    description: '',
    criteria: {
      interests: [],
      demographics: {},
      behaviors: []
    }
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [campaignsRes, audiencesRes] = await Promise.all([
        fetch('/api/advertising/campaigns', {
          method: 'GET',
          credentials: 'include'
        }),
        fetch('/api/advertising/audiences', {
          method: 'GET',
          credentials: 'include'
        })
      ]);

      if (campaignsRes.ok) {
        const campaignsData = await campaignsRes.json();
        setCampaigns(campaignsData);
      }

      if (audiencesRes.ok) {
        const audiencesData = await audiencesRes.json();
        setAudiences(audiencesData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    try {
      const response = await fetch('/api/advertising/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...campaignForm,
          dailyBudget: parseFloat(campaignForm.dailyBudget),
          type: 'standard'
        })
      });

      if (response.ok) {
        const newCampaign = await response.json();
        setCampaigns([...campaigns, newCampaign]);
        setShowCreateCampaign(false);
        setCampaignForm({
          name: '',
          objective: 'awareness',
          dailyBudget: '',
          targeting: { age: { min: 18, max: 65 }, interests: [], location: '' }
        });
        Alert.alert('Success', 'Campaign created successfully!');
      } else {
        Alert.alert('Error', 'Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      Alert.alert('Error', 'Failed to create campaign');
    }
  };

  const createAudience = async () => {
    try {
      const response = await fetch('/api/advertising/audiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...audienceForm,
          type: 'custom'
        })
      });

      if (response.ok) {
        const newAudience = await response.json();
        setAudiences([...audiences, newAudience]);
        setShowCreateAudience(false);
        setAudienceForm({
          name: '',
          description: '',
          criteria: { interests: [], demographics: {}, behaviors: [] }
        });
        Alert.alert('Success', 'Audience created successfully!');
      } else {
        Alert.alert('Error', 'Failed to create audience');
      }
    } catch (error) {
      console.error('Error creating audience:', error);
      Alert.alert('Error', 'Failed to create audience');
    }
  };

  const estimateAudience = async (targeting: any) => {
    try {
      const response = await fetch('/api/advertising/audience/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ targeting })
      });

      if (response.ok) {
        const estimate = await response.json();
        Alert.alert(
          'Audience Estimate',
          `Estimated reach: ${estimate.potentialReach.toLocaleString()} users\n` +
          `Daily cost range: $${estimate.costEstimate.dailyMin.toFixed(2)} - $${estimate.costEstimate.dailyMax.toFixed(2)}`
        );
      }
    } catch (error) {
      console.error('Error estimating audience:', error);
    }
  };

  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      <Text style={styles.sectionTitle}>Campaign Performance</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{campaigns.length}</Text>
          <Text style={styles.statLabel}>Active Campaigns</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            ${campaigns.reduce((sum, c) => sum + (c.spent || 0), 0).toFixed(2)}
          </Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0).toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Total Impressions</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0).toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Total Clicks</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Campaigns</Text>
      {campaigns.slice(0, 3).map(campaign => (
        <View key={campaign.id} style={styles.campaignCard}>
          <View style={styles.campaignHeader}>
            <Text style={styles.campaignName}>{campaign.name}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: campaign.status === 'active' ? '#10B981' : '#6B7280' }
            ]}>
              <Text style={styles.statusText}>{campaign.status}</Text>
            </View>
          </View>
          <Text style={styles.campaignObjective}>{campaign.objective}</Text>
          <View style={styles.campaignStats}>
            <Text style={styles.campaignStat}>Budget: ${campaign.dailyBudget}/day</Text>
            <Text style={styles.campaignStat}>Spent: ${campaign.spent || 0}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderCampaigns = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={styles.sectionTitle}>Your Campaigns</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateCampaign(true)}
        >
          <Text style={styles.createButtonText}>+ Create Campaign</Text>
        </TouchableOpacity>
      </View>

      {campaigns.map(campaign => (
        <View key={campaign.id} style={styles.campaignDetailCard}>
          <View style={styles.campaignHeader}>
            <Text style={styles.campaignName}>{campaign.name}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: campaign.status === 'active' ? '#10B981' : '#6B7280' }
            ]}>
              <Text style={styles.statusText}>{campaign.status}</Text>
            </View>
          </View>
          
          <Text style={styles.campaignObjective}>Objective: {campaign.objective}</Text>
          
          <View style={styles.campaignMetrics}>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>${campaign.dailyBudget}</Text>
              <Text style={styles.metricLabel}>Daily Budget</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>${campaign.spent || 0}</Text>
              <Text style={styles.metricLabel}>Spent</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{campaign.impressions || 0}</Text>
              <Text style={styles.metricLabel}>Impressions</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{campaign.clicks || 0}</Text>
              <Text style={styles.metricLabel}>Clicks</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.estimateButton}
            onPress={() => estimateAudience(campaign.targeting)}
          >
            <Text style={styles.estimateButtonText}>Estimate Reach</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderAudiences = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={styles.sectionTitle}>Custom Audiences</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateAudience(true)}
        >
          <Text style={styles.createButtonText}>+ Create Audience</Text>
        </TouchableOpacity>
      </View>

      {audiences.map(audience => (
        <View key={audience.id} style={styles.audienceCard}>
          <Text style={styles.audienceName}>{audience.name}</Text>
          <Text style={styles.audienceType}>Type: {audience.type}</Text>
          <Text style={styles.audienceSize}>
            {audience.userCount.toLocaleString()} users
          </Text>
          
          <TouchableOpacity style={styles.lookalikeButton}>
            <Text style={styles.lookalikeButtonText}>Create Lookalike</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderCreateCampaignModal = () => (
    <Modal visible={showCreateCampaign} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Create New Campaign</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Campaign Name"
            value={campaignForm.name}
            onChangeText={(text) => setCampaignForm({...campaignForm, name: text})}
          />
          
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Objective:</Text>
            <View style={styles.objectiveButtons}>
              {['awareness', 'traffic', 'conversions', 'leads'].map(obj => (
                <TouchableOpacity
                  key={obj}
                  style={[
                    styles.objectiveButton,
                    campaignForm.objective === obj && styles.objectiveButtonActive
                  ]}
                  onPress={() => setCampaignForm({...campaignForm, objective: obj})}
                >
                  <Text style={[
                    styles.objectiveButtonText,
                    campaignForm.objective === obj && styles.objectiveButtonTextActive
                  ]}>
                    {obj.charAt(0).toUpperCase() + obj.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Daily Budget ($)"
            value={campaignForm.dailyBudget}
            onChangeText={(text) => setCampaignForm({...campaignForm, dailyBudget: text})}
            keyboardType="numeric"
          />
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCreateCampaign(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.createModalButton}
              onPress={createCampaign}
            >
              <Text style={styles.createModalButtonText}>Create Campaign</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderCreateAudienceModal = () => (
    <Modal visible={showCreateAudience} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Create Custom Audience</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Audience Name"
            value={audienceForm.name}
            onChangeText={(text) => setAudienceForm({...audienceForm, name: text})}
          />
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            value={audienceForm.description}
            onChangeText={(text) => setAudienceForm({...audienceForm, description: text})}
            multiline
            numberOfLines={3}
          />
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCreateAudience(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.createModalButton}
              onPress={createAudience}
            >
              <Text style={styles.createModalButtonText}>Create Audience</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Business Advertising</Text>
        <Text style={styles.headerSubtitle}>Facebook-Style Campaign Management</Text>
      </LinearGradient>

      <View style={styles.tabBar}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'campaigns', label: 'Campaigns' },
          { key: 'audiences', label: 'Audiences' }
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              selectedTab === tab.key && styles.activeTab
            ]}
            onPress={() => setSelectedTab(tab.key)}
          >
            <Text style={[
              styles.tabText,
              selectedTab === tab.key && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'campaigns' && renderCampaigns()}
        {selectedTab === 'audiences' && renderAudiences()}
      </ScrollView>

      {renderCreateCampaignModal()}
      {renderCreateAudienceModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginTop: 5,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#667eea',
  },
  tabText: {
    fontSize: 16,
    color: '#64748b',
  },
  activeTabText: {
    color: '#667eea',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  overviewContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 30,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginRight: '2%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 5,
  },
  campaignCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  campaignName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  campaignObjective: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  campaignStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  campaignStat: {
    fontSize: 12,
    color: '#64748b',
  },
  tabContent: {
    padding: 20,
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  campaignDetailCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  campaignMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  estimateButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  estimateButtonText: {
    color: '#667eea',
    fontWeight: '600',
  },
  audienceCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  audienceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 5,
  },
  audienceType: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 5,
  },
  audienceSize: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
    marginBottom: 10,
  },
  lookalikeButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  lookalikeButtonText: {
    color: '#667eea',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 10,
  },
  pickerContainer: {
    marginBottom: 15,
  },
  objectiveButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  objectiveButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 10,
    marginBottom: 10,
  },
  objectiveButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  objectiveButtonText: {
    color: '#64748b',
  },
  objectiveButtonTextActive: {
    color: 'white',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#64748b',
    fontWeight: '600',
  },
  createModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#667eea',
    marginLeft: 10,
  },
  createModalButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
});

export default BusinessAdvertisingDashboard;