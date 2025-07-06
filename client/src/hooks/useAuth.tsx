// Temporary useAuth hook for onboarding screens
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Return default values for now
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
    };
  }
  return context;
};