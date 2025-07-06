import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  bio?: string;
  interests?: string[];
  userType: string;
  accountType: 'personal' | 'dual';
  businessName?: string;
  businessType?: 'shop' | 'service' | 'entertainment';
  businessDescription?: string;
  businessLocation?: string;
  businessCategories?: string[];
  allowsDelivery?: boolean;
  allowsPickup?: boolean;
  customShipping?: boolean;
  phoneNumber?: string;
  address?: string;
  isVerified?: boolean;
  isPro?: boolean;
  onboardingCompleted?: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'LOGOUT' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const refreshUser = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // For testing, create a mock user with onboarding not completed
      const mockUser: User = {
        id: 'test-user',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        userType: 'buyer',
        accountType: 'personal',
        isVerified: false,
        isPro: false,
        onboardingCompleted: false,
      };
      
      // Simulate API call delay
      setTimeout(() => {
        dispatch({ type: 'SET_USER', payload: mockUser });
      }, 1000);
      
    } catch (error) {
      console.error('Error refreshing user:', error);
      dispatch({ type: 'SET_USER', payload: null });
    }
  };

  const login = async (credentials: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // For now, just set a mock user
      const mockUser: User = {
        id: 'test-user',
        email: credentials.email || 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        userType: 'buyer',
        accountType: 'personal',
        isVerified: false,
        isPro: false,
        onboardingCompleted: false,
      };
      
      dispatch({ type: 'SET_USER', payload: mockUser });
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // For now, just set a mock user
      const mockUser: User = {
        id: 'test-user',
        email: userData.email || 'test@example.com',
        firstName: userData.firstName || 'Test',
        lastName: userData.lastName || 'User',
        userType: 'buyer',
        accountType: 'personal',
        isVerified: false,
        isPro: false,
        onboardingCompleted: false,
      };
      
      dispatch({ type: 'SET_USER', payload: mockUser });
    } catch (error) {
      console.error('Registration error:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateUser = (userData: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    register,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}