import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const ProfessionalProfile = ({ navigation, route }: any) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [saleEventVisible, setSaleEventVisible] = useState(false);
  const [hiringFormVisible, setHiringFormVisible] = useState(false);

  // Mock business data from completed questionnaire
  const businessData = {
    name: 'Brown Barnes Music',
    type: 'entertainment',
    website: 'brownbarnesmusic.com',
    hasWebsiteIntegration: true,
    phone: '(555) 123-4567',
    products: [
      { id: 1, name: 'Live DJ Set (4 hours)', price: 450, inventory: 'Available', category: 'DJ Services' },
      { id: 2, name: 'Wedding Music Package', price: 800, inventory: 'Available', category: 'Wedding' },
      { id: 3, name: 'Corporate Event DJ', price: 600, inventory: 'Available', category: 'Corporate' },
      { id: 4, name: 'Sound Equipment Rental', price: 150, inventory: '5 Available', category: 'Equipment' }
    ],
    analytics: {
      monthlyViews: 1247,
      bookings: 12,
      revenue: 4200,
      customerSatisfaction: 4.8
    }
  };

  const [deliverySettings, setDeliverySettings] = useState({
    allowsDelivery: true,
    allowsPickup: true,
    customShipping: false,
    shippingFee: '25.00'
  });

  const TabButton = ({ id, title, icon }: { id: string; title: string; icon: any }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: activeTab === id ? '#667eea' : '#f5f5f5',
        borderRadius: 8,
        marginRight: 8,
        marginBottom: 8
      }}
      onPress={() => setActiveTab(id)}
    >
      <Ionicons name={icon} size={16} color={activeTab === id ? '#fff' : '#666'} style={{ marginRight: 8 }} />
      <Text style={{ color: activeTab === id ? '#fff' : '#666', fontWeight: '600', fontSize: 14 }}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderOverview = () => (
    <View style={{ padding: 20 }}>
      {/* Website Integration Success */}
      <View style={{ backgroundColor: '#e8f5e8', padding: 16, borderRadius: 12, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#4CAF50' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" style={{ marginRight: 8 }} />
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2e7d32' }}>Website Integrated Successfully!</Text>
        </View>
        <Text style={{ fontSize: 14, color: '#2e7d32', lineHeight: 20 }}>
          Your website {businessData.website} has been seamlessly integrated with MarketPace. All prices, inventory, and services are automatically synced.
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <View style={{ flex: 1, minWidth: 140, backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#eee' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#667eea' }}>{businessData.analytics.monthlyViews}</Text>
          <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Monthly Views</Text>
        </View>
        <View style={{ flex: 1, minWidth: 140, backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#eee' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#4CAF50' }}>${businessData.analytics.revenue}</Text>
          <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>This Month Revenue</Text>
        </View>
        <View style={{ flex: 1, minWidth: 140, backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#eee' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ff6b6b' }}>{businessData.analytics.bookings}</Text>
          <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Active Bookings</Text>
        </View>
        <View style={{ flex: 1, minWidth: 140, backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#eee' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ffa500' }}>{businessData.analytics.customerSatisfaction}⭐</Text>
          <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Customer Rating</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 }}>Quick Actions</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <TouchableOpacity
          style={{ flex: 1, minWidth: 140, backgroundColor: '#667eea', padding: 16, borderRadius: 12, alignItems: 'center' }}
          onPress={() => setSaleEventVisible(true)}
        >
          <Ionicons name="flash" size={20} color="#fff" style={{ marginBottom: 4 }} />
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12, textAlign: 'center' }}>Create Sale Event</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{ flex: 1, minWidth: 140, backgroundColor: '#4CAF50', padding: 16, borderRadius: 12, alignItems: 'center' }}
          onPress={() => setActiveTab('products')}
        >
          <Ionicons name="add-circle" size={20} color="#fff" style={{ marginBottom: 4 }} />
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12, textAlign: 'center' }}>Add Product</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{ flex: 1, minWidth: 140, backgroundColor: '#ff6b6b', padding: 16, borderRadius: 12, alignItems: 'center' }}
          onPress={() => setHiringFormVisible(true)}
        >
          <Ionicons name="people" size={20} color="#fff" style={{ marginBottom: 4 }} />
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12, textAlign: 'center' }}>Post Job Opening</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{ flex: 1, minWidth: 140, backgroundColor: '#ffa500', padding: 16, borderRadius: 12, alignItems: 'center' }}
          onPress={() => setActiveTab('community')}
        >
          <Ionicons name="share-social" size={20} color="#fff" style={{ marginBottom: 4 }} />
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12, textAlign: 'center' }}>Share to Community</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProducts = () => (
    <View style={{ padding: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>Products & Services</Text>
        <TouchableOpacity style={{ backgroundColor: '#667eea', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}>
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12 }}>+ Add New</Text>
        </TouchableOpacity>
      </View>

      {businessData.products.map((product) => (
        <View key={product.id} style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#eee' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 }}>{product.name}</Text>
              <Text style={{ fontSize: 12, color: '#666', backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' }}>
                {product.category}
              </Text>
            </View>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#4CAF50' }}>${product.price}</Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <Text style={{ fontSize: 12, color: '#666' }}>Stock: {product.inventory}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={{ backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                <Text style={{ fontSize: 10, color: '#666' }}>Edit Price</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ backgroundColor: '#667eea', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                <Text style={{ fontSize: 10, color: '#fff' }}>Promote</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderDelivery = () => (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 }}>Delivery & Shipping Settings</Text>
      
      <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#eee' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>MarketPace Delivery</Text>
          <Switch
            value={deliverySettings.allowsDelivery}
            onValueChange={(value) => setDeliverySettings(prev => ({ ...prev, allowsDelivery: value }))}
          />
        </View>
        <Text style={{ fontSize: 12, color: '#666' }}>Let MarketPace drivers deliver your services and equipment</Text>
      </View>

      <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#eee' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>Customer Pickup</Text>
          <Switch
            value={deliverySettings.allowsPickup}
            onValueChange={(value) => setDeliverySettings(prev => ({ ...prev, allowsPickup: value }))}
          />
        </View>
        <Text style={{ fontSize: 12, color: '#666' }}>Allow customers to pick up directly from your location</Text>
      </View>

      <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#eee' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>Custom Shipping</Text>
          <Switch
            value={deliverySettings.customShipping}
            onValueChange={(value) => setDeliverySettings(prev => ({ ...prev, customShipping: value }))}
          />
        </View>
        <Text style={{ fontSize: 12, color: '#666' }}>Set your own shipping rates and handling fees</Text>
        
        {deliverySettings.customShipping && (
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 }}>Shipping Fee</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14 }}
              placeholder="Enter shipping fee"
              value={deliverySettings.shippingFee}
              onChangeText={(text) => setDeliverySettings(prev => ({ ...prev, shippingFee: text }))}
              keyboardType="numeric"
            />
          </View>
        )}
      </View>
    </View>
  );

  const renderAnalytics = () => (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 }}>Advanced Analytics</Text>
      
      <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#eee' }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 }}>Performance Metrics</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontSize: 14, color: '#666' }}>Click-through Rate</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#4CAF50' }}>12.4%</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontSize: 14, color: '#666' }}>Conversion Rate</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#4CAF50' }}>8.7%</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontSize: 14, color: '#666' }}>Average Order Value</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#4CAF50' }}>$350</Text>
        </View>
      </View>

      <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#eee' }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 }}>Customer Demographics</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontSize: 14, color: '#666' }}>Age 25-35</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#667eea' }}>45%</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontSize: 14, color: '#666' }}>Age 35-45</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#667eea' }}>32%</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontSize: 14, color: '#666' }}>Local Events</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#667eea' }}>68%</Text>
        </View>
      </View>
    </View>
  );

  const renderCommunity = () => (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 }}>Community Engagement</Text>
      
      <TouchableOpacity style={{ backgroundColor: '#4CAF50', padding: 16, borderRadius: 12, marginBottom: 16, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Ionicons name="share-social" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>Share Shop to Community Feed</Text>
        </View>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', textAlign: 'center' }}>
          Let your neighbors know about your music services and special offers
        </Text>
      </TouchableOpacity>

      <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#eee' }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 }}>Recent Community Activity</Text>
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 14, color: '#333', fontWeight: '600' }}>Sarah M. shared your Wedding Package</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>2 hours ago • 5 likes, 2 comments</Text>
        </View>
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 14, color: '#333', fontWeight: '600' }}>Mike R. booked Corporate Event DJ</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>1 day ago • Left 5-star review</Text>
        </View>
      </View>
    </View>
  );

  const renderMessages = () => (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 }}>Customer Messages</Text>
      
      <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#eee' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#333' }}>Jessica Chen</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>2 min ago</Text>
        </View>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
          Hi! I'm interested in your wedding music package. Do you provide sound equipment too?
        </Text>
        <TouchableOpacity style={{ backgroundColor: '#667eea', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, alignSelf: 'flex-start' }}>
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Reply</Text>
        </TouchableOpacity>
      </View>

      <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#eee' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#333' }}>Marcus Williams</Text>
          <Text style={{ fontSize: 12, color: '#666' }}>1 hour ago</Text>
        </View>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
          Can you do a corporate event on short notice? We need a DJ for Friday.
        </Text>
        <TouchableOpacity style={{ backgroundColor: '#667eea', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, alignSelf: 'flex-start' }}>
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Reply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#fff', paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}>{businessData.name}</Text>
            <Text style={{ fontSize: 14, color: '#666' }}>Professional Profile • Entertainment</Text>
          </View>
          <View style={{ backgroundColor: '#4CAF50', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>PRO ACTIVE</Text>
          </View>
        </View>
      </View>

      {/* Navigation Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
        <TabButton id="overview" title="Overview" icon="home" />
        <TabButton id="products" title="Products" icon="grid" />
        <TabButton id="delivery" title="Delivery" icon="car" />
        <TabButton id="analytics" title="Analytics" icon="bar-chart" />
        <TabButton id="community" title="Community" icon="people" />
        <TabButton id="messages" title="Messages" icon="chatbubble" />
      </ScrollView>

      {/* Content */}
      <ScrollView style={{ flex: 1 }}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'products' && renderProducts()}
        {activeTab === 'delivery' && renderDelivery()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'community' && renderCommunity()}
        {activeTab === 'messages' && renderMessages()}
      </ScrollView>

      {/* Sale Event Modal */}
      {saleEventVisible && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 12, width: '90%' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 }}>Create Sale Event</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 }}
              placeholder="Sale Event Title"
            />
            <TextInput
              style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 }}
              placeholder="Discount Percentage"
              keyboardType="numeric"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={{ backgroundColor: '#ccc', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 }}
                onPress={() => setSaleEventVisible(false)}
              >
                <Text style={{ color: '#666', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ backgroundColor: '#667eea', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 }}
                onPress={() => setSaleEventVisible(false)}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Create Sale</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Hiring Form Modal */}
      {hiringFormVisible && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 12, width: '90%' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 }}>Post Job Opening</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 }}
              placeholder="Job Title"
            />
            <TextInput
              style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, minHeight: 80, textAlignVertical: 'top' }}
              placeholder="Job Description"
              multiline
            />
            <TextInput
              style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 }}
              placeholder="Hourly Rate"
              keyboardType="numeric"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={{ backgroundColor: '#ccc', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 }}
                onPress={() => setHiringFormVisible(false)}
              >
                <Text style={{ color: '#666', fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ backgroundColor: '#4CAF50', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 }}
                onPress={() => setHiringFormVisible(false)}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Post Job</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ProfessionalProfile;