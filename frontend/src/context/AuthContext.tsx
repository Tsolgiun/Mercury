import React, { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../api/authApi';
import api, { setTokens, clearTokens, getAccessToken } from '../lib/api';

// Define user type
export interface User {
  _id: string;
  email: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  isAdmin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Define auth context type
interface AuthContextType {
  currentUser: User | null;
  userLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check if we have a token
        const token = getAccessToken();
        
        if (!token) {
          setUserLoading(false);
          return;
        }
        
        // Fetch user profile using axios instance
        const response = await api.get('/users/me');
        setCurrentUser(response.data);
      } catch (error: any) {
        console.error('Error checking auth status:', error);
        
        // Clear tokens for authentication errors and bad requests
        // This prevents issues with malformed tokens or invalid requests
        if (error.response && (
            error.response.status === 400 || // Bad Request
            error.response.status === 401 || // Unauthorized
            error.response.status === 403    // Forbidden
          )) {
          console.log('Authentication error or bad request, clearing tokens');
          clearTokens();
        } else {
          console.log('Non-authentication error, keeping tokens');
          // For other errors (network, server errors), keep the tokens
          // This prevents logout on temporary issues
        }
      } finally {
        setUserLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Listen for auth errors
  useEffect(() => {
    const handleAuthError = () => {
      setCurrentUser(null);
      clearTokens();
    };
    
    window.addEventListener('auth-error', handleAuthError);
    
    return () => {
      window.removeEventListener('auth-error', handleAuthError);
    };
  }, []);

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      
      // Save tokens
      setTokens(response.accessToken, response.refreshToken);
      
      // Set user
      setCurrentUser(response.user);
    } catch (error: any) {
      console.error('Login error:', error.message);
      throw error;
    }
  };

  // Register with email and password
  const register = async (email: string, password: string, name: string, username: string) => {
    try {
      console.log('Registering with data:', { email, name, username, password: '******' });
      
      const response = await authApi.register({
        email,
        password,
        name,
        username,
      });
      
      console.log('Registration successful:', response);
      
      // Save tokens
      setTokens(response.accessToken, response.refreshToken);
      
      // Set user
      setCurrentUser(response.user);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Log more detailed error information
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      }
      
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear user and tokens regardless of API success
      setCurrentUser(null);
      clearTokens();
    }
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<User>) => {
    try {
      const response = await api.put('/users/profile', data);
      const updatedUser = response.data;
      
      // Update local state
      setCurrentUser(prev => prev ? { ...prev, ...updatedUser } : updatedUser);
    } catch (error: any) {
      console.error('Profile update error:', error.message);
      throw error;
    }
  };

  const value = {
    currentUser,
    userLoading,
    login,
    register,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
