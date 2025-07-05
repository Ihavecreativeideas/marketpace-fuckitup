import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { api } from './api';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.isInitialized = false;
  }

  async init() {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      if (userData) {
        this.currentUser = JSON.parse(userData);
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing auth service:', error);
      this.isInitialized = true;
    }
  }

  async setCurrentUser(user) {
    this.currentUser = user;
    try {
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  }

  async clearCurrentUser() {
    this.currentUser = null;
    try {
      await AsyncStorage.removeItem('user_data');
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  async login(email, password) {
    try {
      const response = await api.login(email, password);
      await this.setCurrentUser(response.user);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await api.register(userData);
      await this.setCurrentUser(response.user);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.clearCurrentUser();
    }
  }

  async refreshUser() {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Not authenticated');
      }

      const user = await api.getCurrentUser();
      await this.setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('Error refreshing user:', error);
      // If refresh fails, clear the user data
      await this.clearCurrentUser();
      throw error;
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await api.updateProfile(profileData);
      await this.setCurrentUser(response.user);
      return response;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  // Google Sign-In
  async loginWithGoogle() {
    try {
      const [request, response, promptAsync] = Google.useAuthRequest({
        expoClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      });

      const result = await promptAsync();

      if (result.type === 'success') {
        const { authentication } = result;
        
        // Send the Google token to your backend
        const response = await api.post('/auth/google', {
          token: authentication.accessToken,
        });

        await this.setCurrentUser(response.user);
        return response;
      } else {
        throw new Error('Google login was cancelled or failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  // Facebook Sign-In
  async loginWithFacebook() {
    try {
      const [request, response, promptAsync] = Facebook.useAuthRequest({
        clientId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID,
      });

      const result = await promptAsync();

      if (result.type === 'success') {
        const { authentication } = result;
        
        // Send the Facebook token to your backend
        const response = await api.post('/auth/facebook', {
          token: authentication.accessToken,
        });

        await this.setCurrentUser(response.user);
        return response;
      } else {
        throw new Error('Facebook login was cancelled or failed');
      }
    } catch (error) {
      console.error('Facebook login error:', error);
      throw error;
    }
  }

  // Guest login
  async loginAsGuest() {
    try {
      const response = await api.post('/auth/guest');
      await this.setCurrentUser(response.user);
      return response;
    } catch (error) {
      console.error('Guest login error:', error);
      throw error;
    }
  }

  // Password reset
  async requestPasswordReset(email) {
    try {
      return await api.post('/auth/forgot-password', { email });
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }

  async resetPassword(token, newPassword) {
    try {
      return await api.post('/auth/reset-password', { token, password: newPassword });
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  // Email verification
  async verifyEmail(token) {
    try {
      const response = await api.post('/auth/verify-email', { token });
      if (response.user) {
        await this.setCurrentUser(response.user);
      }
      return response;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  async resendVerificationEmail() {
    try {
      return await api.post('/auth/resend-verification');
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  }

  // Account management
  async changePassword(currentPassword, newPassword) {
    try {
      return await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  async deleteAccount() {
    try {
      await api.delete('/auth/account');
      await this.clearCurrentUser();
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  }

  // Utility methods
  async checkAuthStatus() {
    try {
      if (!this.isAuthenticated()) {
        return false;
      }

      // Try to refresh user data to verify token is still valid
      await this.refreshUser();
      return true;
    } catch (error) {
      console.error('Auth status check failed:', error);
      await this.clearCurrentUser();
      return false;
    }
  }

  // Get user permissions
  getUserPermissions() {
    if (!this.currentUser) return [];
    
    const permissions = [];
    
    if (this.currentUser.isAdmin) {
      permissions.push('admin');
    }
    
    if (this.currentUser.isDriver) {
      permissions.push('driver');
    }
    
    if (this.currentUser.businessProfile) {
      permissions.push('business');
    }
    
    return permissions;
  }

  hasPermission(permission) {
    return this.getUserPermissions().includes(permission);
  }

  // Get user profile completion percentage
  getProfileCompletionPercentage() {
    if (!this.currentUser) return 0;
    
    const requiredFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'address',
      'profileImage',
    ];
    
    const completedFields = requiredFields.filter(field => 
      this.currentUser[field] && this.currentUser[field].trim() !== ''
    );
    
    return Math.round((completedFields.length / requiredFields.length) * 100);
  }
}

// Create and initialize the auth service
const authService = new AuthService();
authService.init();

export default authService;
export { authService };
