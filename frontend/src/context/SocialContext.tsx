import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../lib/api';
import { useAuth } from '../hooks/use-auth';
import { User } from './AuthContext';

// Define types
export interface UserStats {
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing: boolean;
}

export interface FollowUser extends User {
  isFollowing: boolean;
}

export interface FollowResponse {
  followers?: FollowUser[];
  following?: FollowUser[];
  page: number;
  pages: number;
  total: number;
}

// Define social context type
interface SocialContextType {
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  getFollowers: (userId: string, page?: number, limit?: number) => Promise<FollowResponse>;
  getFollowing: (userId: string, page?: number, limit?: number) => Promise<FollowResponse>;
  getUserStats: (userId: string) => Promise<UserStats>;
  getSuggestedUsers: (limit?: number) => Promise<User[]>;
  checkFollowStatus: (userId: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

// Create social context
const SocialContext = createContext<SocialContextType | undefined>(undefined);

// Social provider component
export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  // Follow a user
  const followUser = useCallback(async (userId: string): Promise<void> => {
    if (!currentUser) {
      throw new Error('You must be logged in to follow users');
    }

    setLoading(true);
    setError(null);
    
    try {
      await api.post(`/social/follow/${userId}`);
    } catch (error: any) {
      console.error(`Error following user ${userId}:`, error);
      setError(error.message || 'Failed to follow user');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentUser, setLoading, setError]);

  // Unfollow a user
  const unfollowUser = useCallback(async (userId: string): Promise<void> => {
    if (!currentUser) {
      throw new Error('You must be logged in to unfollow users');
    }

    setLoading(true);
    setError(null);
    
    try {
      await api.delete(`/social/follow/${userId}`);
    } catch (error: any) {
      console.error(`Error unfollowing user ${userId}:`, error);
      setError(error.message || 'Failed to unfollow user');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentUser, setLoading, setError]);

  // Get followers of a user
  const getFollowers = useCallback(async (userId: string, page = 1, limit = 10): Promise<FollowResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/social/followers/${userId}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching followers for user ${userId}:`, error);
      setError(error.message || 'Failed to fetch followers');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Get users followed by a user
  const getFollowing = useCallback(async (userId: string, page = 1, limit = 10): Promise<FollowResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/social/following/${userId}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching following for user ${userId}:`, error);
      setError(error.message || 'Failed to fetch following');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Get user stats (followers count, following count, posts count)
  const getUserStats = useCallback(async (userId: string): Promise<UserStats> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/social/stats/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching stats for user ${userId}:`, error);
      setError(error.message || 'Failed to fetch user stats');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Get suggested users to follow
  const getSuggestedUsers = useCallback(async (limit = 5): Promise<User[]> => {
    if (!currentUser) {
      return [];
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/social/suggestions?limit=${limit}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching suggested users:', error);
      setError(error.message || 'Failed to fetch suggested users');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentUser, setLoading, setError]);

  // Check if a user is following another user
  const checkFollowStatus = useCallback(async (userId: string): Promise<boolean> => {
    if (!currentUser) {
      return false;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/social/follow/check/${userId}`);
      return response.data.isFollowing;
    } catch (error: any) {
      console.error(`Error checking follow status for user ${userId}:`, error);
      setError(error.message || 'Failed to check follow status');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentUser, setLoading, setError]);

  const value = {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getUserStats,
    getSuggestedUsers,
    checkFollowStatus,
    loading,
    error,
  };

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>;
};

// Custom hook to use social context
export const useSocialContext = () => {
  const context = useContext(SocialContext);
  if (context === undefined) {
    throw new Error('useSocialContext must be used within a SocialProvider');
  }
  return context;
};
