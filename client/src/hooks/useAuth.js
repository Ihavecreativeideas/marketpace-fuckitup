import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, endpoints, isUnauthorizedError } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const userData = await api.get(endpoints.auth.user);
      setUser(userData);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        setUser(null);
      } else {
        console.error('Error fetching user:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    // Redirect to login endpoint
    window.location.href = endpoints.auth.login;
  };

  const logout = () => {
    // Redirect to logout endpoint
    window.location.href = endpoints.auth.logout;
  };

  const updateUser = (userData) => {
    setUser(prevUser => ({ ...prevUser, ...userData }));
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    refetch: fetchUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
