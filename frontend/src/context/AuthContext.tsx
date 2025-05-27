import React, { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../api/authApi';
import api, { setTokens, clearTokens, getAccessToken, getRefreshToken, refreshAccessToken } from '../lib/api';
import { 
  initSessionPersistence, 
  performProactiveRefresh, 
  recordTokenRefresh, 
  setAuthCheckStatus 
} from '../lib/sessionPersistence';

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
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  // Initialize session persistence on mount
  useEffect(() => {
    initSessionPersistence();
  }, []);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      setAuthCheckStatus('pending');
      
      try {
        // Check if we have a token
        const token = getAccessToken();
        const refreshToken = getRefreshToken();
        
        if (!token) {
          // If no access token but we have a refresh token, try to refresh
          if (refreshToken) {
            try {
              console.log('No access token but refresh token exists, attempting to refresh');
              
              // Try to refresh the token
              const refreshed = await performProactiveRefresh();
              
              if (refreshed) {
                // Successfully refreshed, now fetch user profile
                const response = await api.get('/users/me');
                setCurrentUser(response.data);
                console.log('Successfully refreshed token and fetched user profile');
                setAuthCheckStatus('success');
                recordTokenRefresh();
              } else {
                console.log('Token refresh not performed or failed');
                setAuthCheckStatus('failed');
              }
            } catch (refreshError: any) {
              console.error('Failed to refresh token:', refreshError);
              // Only clear tokens if it's an authentication error
              if (refreshError.response && (
                refreshError.response.status === 401 || // Unauthorized
                refreshError.response.status === 403    // Forbidden
              )) {
                console.log('Authentication error during token refresh, clearing tokens');
                clearTokens();
              }
              setAuthCheckStatus('failed');
            }
          } else {
            console.log('No tokens available, user is not logged in');
            setAuthCheckStatus('failed');
          }
          
          setUserLoading(false);
          return;
        }
        
        // Fetch user profile using axios instance
        try {
          console.log('Attempting to fetch user profile with token:', token.substring(0, 10) + '...');
          const response = await api.get('/users/me');
          setCurrentUser(response.data);
          console.log('Successfully fetched user profile');
          setAuthCheckStatus('success');
          recordTokenRefresh();
        } catch (profileError: any) {
          console.error('Error fetching user profile:', profileError);
          
          // ADD THIS DEBUGGING CODE RIGHT HERE
          if (profileError.response) {
            console.log('Error status:', profileError.response.status);
            console.log('Error data:', profileError.response.data);
          }
          
          // MODIFY THIS PART: Don't clear tokens on 400 errors
          if (profileError.response) {
            // Only clear tokens for actual authentication errors (401, 403)
            // NOT for 400 Bad Request which could be a temporary issue
            if (profileError.response.status === 401 || profileError.response.status === 403) {
              console.log('Authentication error, clearing tokens');
              clearTokens();
            } else if (profileError.response.status === 400) {
              console.log('Bad request error, but NOT clearing tokens - may be a temporary issue');
              // Try to refresh the token instead of clearing
              try {
                const refreshed = await performProactiveRefresh();
                if (refreshed) {
                  console.log('Token refreshed after 400 error');
                  // Try fetching profile again
                  try {
                    const retryResponse = await api.get('/users/me');
                    setCurrentUser(retryResponse.data);
                    console.log('Successfully fetched user profile after token refresh');
                    setAuthCheckStatus('success');
                    recordTokenRefresh();
                    return; // Exit early if successful
                  } catch (retryError) {
                    console.error('Failed to fetch profile after token refresh:', retryError);
                  }
                }
              } catch (refreshError) {
                console.error('Failed to refresh token after 400 error:', refreshError);
              }
            } else {
              console.log(`Received ${profileError.response.status} error, not clearing tokens`);
            }
          }
          setAuthCheckStatus('failed');
        }
      } catch (error: any) {
        console.error('Error in auth check process:', error);
        setAuthCheckStatus('failed');
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
      
      console.log('Login response received in AuthContext:', {
        success: response.success,
        hasUser: !!response.user,
        hasTokens: !!(response.accessToken && response.refreshToken)
      });
      
      // Validate necessary data is present
      if (!response.accessToken || !response.refreshToken || !response.user) {
        console.error('Invalid login response:', response);
        throw new Error('Invalid login response from server');
      }
      
      // Save tokens
      setTokens(response.accessToken, response.refreshToken);
      
      // Record token refresh time
      recordTokenRefresh();
      
      // Set user and cache it
      setCurrentUser(response.user);
      localStorage.setItem('cached_user_data', JSON.stringify(response.user));
      
      // Update auth check status
      setAuthCheckStatus('success');
    } catch (error: any) {
      console.error('Login error:', error.message);
      setAuthCheckStatus('failed');
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
      
      // Record token refresh time
      recordTokenRefresh();
      
      // Set user and cache it
      setCurrentUser(response.user);
      localStorage.setItem('cached_user_data', JSON.stringify(response.user));
      
      // Update auth check status
      setAuthCheckStatus('success');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Log more detailed error information
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      }
      
      setAuthCheckStatus('failed');
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
      // Clear user, tokens, and cached data
      setCurrentUser(null);
      clearTokens();
      localStorage.removeItem('cached_user_data');
      setAuthCheckStatus('failed');
    }
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<User>) => {
    try {
      const response = await api.put('/users/profile', data);
      const updatedUser = response.data;
      
      // Update local state and cache
      setCurrentUser(prev => {
        const newUser = prev ? { ...prev, ...updatedUser } : updatedUser;
        localStorage.setItem('cached_user_data', JSON.stringify(newUser));
        return newUser;
      });
    } catch (error: any) {
      console.error('Profile update error:', error.message);
      throw error;
    }
  };

  // Add this at the beginning of your AuthProvider component
  useEffect(() => {
    // Try to load user from localStorage if available
    const cachedUserData = localStorage.getItem('cached_user_data');
    if (cachedUserData) {
      try {
        const userData = JSON.parse(cachedUserData);
        setCurrentUser(userData);
        console.log('Loaded user data from cache');
      } catch (e) {
        console.error('Failed to parse cached user data:', e);
      }
    }
  }, []);

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
