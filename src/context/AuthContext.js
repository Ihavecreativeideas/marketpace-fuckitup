import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/auth';

// Initial state
const initialState = {
  user: null,
  loading: true,
  isAuthenticated: false,
  error: null,
};

// Action types
const AUTH_ACTION_TYPES = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  CLEAR_USER: 'CLEAR_USER',
  UPDATE_USER: 'UPDATE_USER',
};

// Reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: null,
      };

    case AUTH_ACTION_TYPES.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
        error: null,
      };

    case AUTH_ACTION_TYPES.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        error: null,
      };

    case AUTH_ACTION_TYPES.CLEAR_USER:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };

    case AUTH_ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    default:
      return state;
  }
}

// Create context
const AuthContext = createContext();

// Provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      dispatch({ type: AUTH_ACTION_TYPES.SET_LOADING, payload: true });
      
      const isAuthenticated = await authService.checkAuthStatus();
      
      if (isAuthenticated) {
        const user = authService.getCurrentUser();
        dispatch({ type: AUTH_ACTION_TYPES.SET_USER, payload: user });
      } else {
        dispatch({ type: AUTH_ACTION_TYPES.CLEAR_USER });
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      dispatch({ type: AUTH_ACTION_TYPES.SET_ERROR, payload: error.message });
      dispatch({ type: AUTH_ACTION_TYPES.CLEAR_USER });
    }
  };

  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTION_TYPES.SET_LOADING, payload: true });
      
      const response = await authService.login(email, password);
      dispatch({ type: AUTH_ACTION_TYPES.SET_USER, payload: response.user });
      
      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTION_TYPES.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTION_TYPES.SET_LOADING, payload: true });
      
      const response = await authService.register(userData);
      dispatch({ type: AUTH_ACTION_TYPES.SET_USER, payload: response.user });
      
      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTION_TYPES.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      dispatch({ type: AUTH_ACTION_TYPES.SET_LOADING, payload: true });
      
      const response = await authService.loginWithGoogle();
      dispatch({ type: AUTH_ACTION_TYPES.SET_USER, payload: response.user });
      
      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTION_TYPES.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const loginWithFacebook = async () => {
    try {
      dispatch({ type: AUTH_ACTION_TYPES.SET_LOADING, payload: true });
      
      const response = await authService.loginWithFacebook();
      dispatch({ type: AUTH_ACTION_TYPES.SET_USER, payload: response.user });
      
      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTION_TYPES.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const loginAsGuest = async () => {
    try {
      dispatch({ type: AUTH_ACTION_TYPES.SET_LOADING, payload: true });
      
      const response = await authService.loginAsGuest();
      dispatch({ type: AUTH_ACTION_TYPES.SET_USER, payload: response.user });
      
      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTION_TYPES.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const logout = async () => {
    try {
      dispatch({ type: AUTH_ACTION_TYPES.SET_LOADING, payload: true });
      
      await authService.logout();
      dispatch({ type: AUTH_ACTION_TYPES.CLEAR_USER });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails on server, clear local state
      dispatch({ type: AUTH_ACTION_TYPES.CLEAR_USER });
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      dispatch({ type: AUTH_ACTION_TYPES.SET_USER, payload: response.user });
      
      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTION_TYPES.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const user = await authService.refreshUser();
      dispatch({ type: AUTH_ACTION_TYPES.SET_USER, payload: user });
      
      return user;
    } catch (error) {
      console.error('Refresh user error:', error);
      dispatch({ type: AUTH_ACTION_TYPES.CLEAR_USER });
      throw error;
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      return await authService.requestPasswordReset(email);
    } catch (error) {
      dispatch({ type: AUTH_ACTION_TYPES.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      return await authService.resetPassword(token, newPassword);
    } catch (error) {
      dispatch({ type: AUTH_ACTION_TYPES.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const verifyEmail = async (token) => {
    try {
      const response = await authService.verifyEmail(token);
      if (response.user) {
        dispatch({ type: AUTH_ACTION_TYPES.SET_USER, payload: response.user });
      }
      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTION_TYPES.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const resendVerificationEmail = async () => {
    try {
      return await authService.resendVerificationEmail();
    } catch (error) {
      dispatch({ type: AUTH_ACTION_TYPES.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      return await authService.changePassword(currentPassword, newPassword);
    } catch (error) {
      dispatch({ type: AUTH_ACTION_TYPES.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const deleteAccount = async () => {
    try {
      dispatch({ type: AUTH_ACTION_TYPES.SET_LOADING, payload: true });
      
      await authService.deleteAccount();
      dispatch({ type: AUTH_ACTION_TYPES.CLEAR_USER });
    } catch (error) {
      dispatch({ type: AUTH_ACTION_TYPES.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTION_TYPES.SET_ERROR, payload: null });
  };

  // Utility functions
  const hasPermission = (permission) => {
    return authService.hasPermission(permission);
  };

  const getUserPermissions = () => {
    return authService.getUserPermissions();
  };

  const getProfileCompletionPercentage = () => {
    return authService.getProfileCompletionPercentage();
  };

  const isEmailVerified = () => {
    return state.user?.emailVerified || false;
  };

  const isProfileComplete = () => {
    return getProfileCompletionPercentage() >= 80;
  };

  const needsOnboarding = () => {
    return state.user && (!isEmailVerified() || !isProfileComplete());
  };

  // Context value
  const value = {
    // State
    user: state.user,
    loading: state.loading,
    isAuthenticated: state.isAuthenticated,
    error: state.error,

    // Actions
    login,
    register,
    loginWithGoogle,
    loginWithFacebook,
    loginAsGuest,
    logout,
    updateProfile,
    refreshUser,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
    changePassword,
    deleteAccount,
    clearError,

    // Utilities
    hasPermission,
    getUserPermissions,
    getProfileCompletionPercentage,
    isEmailVerified,
    isProfileComplete,
    needsOnboarding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default AuthContext;
