import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
    this.refreshToken = null;
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  async init() {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (token) this.token = token;
      if (refreshToken) this.refreshToken = refreshToken;
    } catch (error) {
      console.error('Error initializing API service:', error);
    }
  }

  async setTokens(accessToken, refreshToken) {
    this.token = accessToken;
    this.refreshToken = refreshToken;
    
    try {
      await AsyncStorage.setItem('access_token', accessToken);
      if (refreshToken) {
        await AsyncStorage.setItem('refresh_token', refreshToken);
      }
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  }

  async clearTokens() {
    this.token = null;
    this.refreshToken = null;
    
    try {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: this.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      await this.setTokens(data.accessToken, data.refreshToken);

      // Process failed queue
      this.failedQueue.forEach(({ resolve }) => {
        resolve(data.accessToken);
      });
      this.failedQueue = [];

      return data.accessToken;
    } catch (error) {
      // Process failed queue
      this.failedQueue.forEach(({ reject }) => {
        reject(error);
      });
      this.failedQueue = [];

      await this.clearTokens();
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      let response = await fetch(url, config);

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && this.refreshToken && !endpoint.includes('/auth/')) {
        try {
          await this.refreshAccessToken();
          
          // Retry the original request with new token
          config.headers = {
            ...this.getAuthHeaders(),
            ...options.headers,
          };
          response = await fetch(url, config);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          throw new Error('Authentication failed');
        }
      }

      if (!response.ok) {
        const errorData = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorJson = JSON.parse(errorData);
          errorMessage = errorJson.message || errorMessage;
        } catch {
          // Keep the default error message
        }
        
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // HTTP method helpers
  async get(endpoint, params = {}) {
    const queryString = Object.keys(params).length > 0 
      ? '?' + new URLSearchParams(params).toString()
      : '';
    
    return this.request(`${endpoint}${queryString}`, {
      method: 'GET',
    });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // File upload helper
  async uploadFile(endpoint, formData) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {};
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorJson = JSON.parse(errorData);
          errorMessage = errorJson.message || errorMessage;
        } catch {
          // Keep the default error message
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  // Specific API methods
  async login(email, password) {
    const response = await this.post('/auth/login', { email, password });
    if (response.accessToken) {
      await this.setTokens(response.accessToken, response.refreshToken);
    }
    return response;
  }

  async register(userData) {
    const response = await this.post('/auth/register', userData);
    if (response.accessToken) {
      await this.setTokens(response.accessToken, response.refreshToken);
    }
    return response;
  }

  async logout() {
    try {
      if (this.token) {
        await this.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.clearTokens();
    }
  }

  async getCurrentUser() {
    return this.get('/auth/me');
  }

  async updateProfile(profileData) {
    return this.put('/auth/profile', profileData);
  }

  // Marketplace methods
  async getListings(params = {}) {
    return this.get('/marketplace/listings', params);
  }

  async createListing(listingData) {
    return this.post('/marketplace/listings', listingData);
  }

  async getListing(listingId) {
    return this.get(`/marketplace/listings/${listingId}`);
  }

  async updateListing(listingId, listingData) {
    return this.put(`/marketplace/listings/${listingId}`, listingData);
  }

  async deleteListing(listingId) {
    return this.delete(`/marketplace/listings/${listingId}`);
  }

  // Order methods
  async createOrder(orderData) {
    return this.post('/orders', orderData);
  }

  async getOrder(orderId) {
    return this.get(`/orders/${orderId}`);
  }

  async getMyOrders(params = {}) {
    return this.get('/orders/my-orders', params);
  }

  // Driver methods
  async applyAsDriver(applicationData) {
    return this.uploadFile('/drivers/apply', applicationData);
  }

  async getDriverRoutes() {
    return this.get('/drivers/routes');
  }

  async acceptRoute(routeId) {
    return this.post(`/drivers/routes/${routeId}/accept`);
  }

  async completeStop(routeId, stopIndex) {
    return this.post(`/drivers/routes/${routeId}/stops/${stopIndex}/complete`);
  }

  // Payment methods
  async createPaymentIntent(amount, orderId) {
    return this.post('/payments/create-intent', { amount, orderId });
  }

  async confirmPayment(paymentIntentId, orderId) {
    return this.post('/payments/confirm', { paymentIntentId, orderId });
  }

  // Community methods
  async getCommunityPosts(params = {}) {
    return this.get('/community/posts', params);
  }

  async createCommunityPost(postData) {
    return this.post('/community/posts', postData);
  }

  async likeCommunityPost(postId) {
    return this.post(`/community/posts/${postId}/like`);
  }

  async reportCommunityPost(postId, reason) {
    return this.post(`/community/posts/${postId}/report`, { reason });
  }

  // Admin methods
  async getAdminAnalytics() {
    return this.get('/admin/analytics');
  }

  async getPendingDrivers() {
    return this.get('/admin/drivers/pending');
  }

  async approveDriver(driverId, approved) {
    return this.post(`/admin/drivers/${driverId}/approve`, { approved });
  }

  async getReportedContent() {
    return this.get('/admin/reports');
  }

  async handleReport(reportId, action) {
    return this.post(`/admin/reports/${reportId}/action`, { action });
  }
}

// Create and initialize the API service
const api = new ApiService();
api.init();

export default api;
export { api };
