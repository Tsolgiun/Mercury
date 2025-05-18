import axios from 'axios';

// Base URL for API requests
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Token storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to prevent hanging requests
  timeout: 10000,
});

/**
 * Get access token from local storage
 * @returns Access token or null if not found
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Get refresh token from local storage
 * @returns Refresh token or null if not found
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Set tokens in local storage
 * @param accessToken - JWT access token
 * @param refreshToken - JWT refresh token
 */
export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

/**
 * Clear tokens from local storage
 */
export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Refresh the access token using the refresh token
 * @returns New access token and refresh token
 */
export const refreshAccessToken = async (): Promise<{ accessToken: string; refreshToken: string }> => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  try {
    // Use a new axios instance to avoid interceptors that might cause infinite loops
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken }, {
      // Set a shorter timeout for refresh requests
      timeout: 5000
    });
    
    // Check if the response contains the expected data
    if (!response.data || !response.data.accessToken || !response.data.refreshToken) {
      console.error('Invalid refresh token response:', response.data);
      throw new Error('Invalid refresh token response');
    }
    
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    
    // Update tokens in local storage
    setTokens(accessToken, newRefreshToken);
    
    return { accessToken, refreshToken: newRefreshToken };
  } catch (error: any) {
    console.error('Token refresh failed:', error.message);
    
    // Only clear tokens for authentication errors (401, 403)
    // This prevents logout on network issues or server errors
    if (error.response && (
        error.response.status === 401 || 
        error.response.status === 403
      )) {
      console.log('Authentication error during token refresh, clearing tokens');
      clearTokens();
    } else {
      console.log('Non-authentication error during token refresh, keeping tokens');
      // For network errors or server errors, we might want to keep the tokens
      // and let the user try again later
    }
    
    throw error;
  }
};

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = getAccessToken();
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Add response interceptor for handling common errors and token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // If there's no response, it's likely a network error
    if (!error.response) {
      console.error('Network error detected:', error.message);
      // Don't trigger logout for network errors
      return Promise.reject({
        ...error,
        isHandled: true,
        message: 'Network error. Please check your connection and try again.'
      });
    }
    
    // Check if this is a bookmark-related request
    const isBookmarkRequest = originalRequest?.url?.includes('/bookmark');
    
    // If error is 401 (Unauthorized) and we haven't tried to refresh the token yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        console.log('Attempting to refresh token due to 401 response');
        // Try to refresh the token
        const { accessToken } = await refreshAccessToken();
        
        // Update the authorization header
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        console.log('Token refreshed successfully, retrying original request');
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError: any) {
        console.error('Token refresh failed:', refreshError.message);
        
        // For bookmark requests, handle auth errors more gracefully
        if (isBookmarkRequest) {
          console.warn('Authentication error during bookmark operation. Not logging out user.');
          // Return a modified error that won't trigger logout
          return Promise.reject({
            ...error,
            isHandled: true,
            message: 'Please log in again to bookmark posts'
          });
        }
        
        // Only dispatch auth-error for actual authentication failures
        if (refreshError.response && (
            refreshError.response.status === 401 || 
            refreshError.response.status === 403
          )) {
          console.log('Dispatching auth-error event due to authentication failure');
          // For other requests, dispatch the auth-error event
          window.dispatchEvent(new CustomEvent('auth-error', { 
            detail: { message: 'Authentication failed. Please sign in again.' } 
          }));
        } else {
          console.log('Not dispatching auth-error for non-authentication error');
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other error cases
    if (error.response) {
      // Server responded with an error status
      switch (error.response.status) {
        case 401:
          // For bookmark requests, handle 401 errors more gracefully
          if (isBookmarkRequest && !error.isHandled) {
            console.warn('Authentication error during bookmark operation. Not logging out user.');
            // Don't trigger logout for bookmark operations
            error.isHandled = true;
            error.message = 'Please log in again to bookmark posts';
          }
          break;
        case 403:
          console.warn('Permission denied:', error.response.data);
          break;
        case 429:
          console.warn('Rate limited. Too many requests.');
          break;
        case 503:
          console.warn('Service unavailable. The server might be down or overloaded.');
          break;
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
    } else {
      // Error setting up the request
      console.error('Request setup error:', error.message);
    }
    
    // Re-throw the error for the calling code to handle
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // Auth endpoints
  register: '/auth/register',
  login: '/auth/login',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  
  // User endpoints
  profile: '/users/me',
  users: '/users',
  user: (id: string) => `/users/${id}`,
  userByUsername: (username: string) => `/users/username/${username}`,
  
  // Post endpoints
  posts: '/posts',
  post: (id: string) => `/posts/${id}`,
  userPosts: (id: string) => `/posts/user/${id}`,
  discoverPosts: '/posts/discover',
  followingPosts: '/posts/following',
  bookmarkedPosts: '/posts/bookmarks',
  likePost: (id: string) => `/posts/${id}/like`,
  unlike: (id: string) => `/posts/${id}/unlike`,
  bookmark: (id: string) => `/posts/${id}/bookmark`,
  unbookmark: (id: string) => `/posts/${id}/unbookmark`,
  tagPosts: (tag: string) => `/posts/tag/${tag}`,
  
  // Comment endpoints
  comments: (postId: string) => `/posts/${postId}/comments`,
  comment: (postId: string, commentId: string) => `/posts/${postId}/comments/${commentId}`,
  replies: (postId: string, commentId: string) => `/posts/${postId}/comments/${commentId}/replies`,
  likeComment: (postId: string, commentId: string) => `/posts/${postId}/comments/${commentId}/like`,
  unlikeComment: (postId: string, commentId: string) => `/posts/${postId}/comments/${commentId}/unlike`,
  
  // Social endpoints
  follow: (id: string) => `/social/follow/${id}`,
  unfollow: (id: string) => `/social/unfollow/${id}`,
  followers: (id: string) => `/social/followers/${id}`,
  following: (id: string) => `/social/following/${id}`,
  
  // Notification endpoints
  notifications: '/notifications',
  notification: (id: string) => `/notifications/${id}`,
  markNotificationRead: (id: string) => `/notifications/${id}/read`,
  markAllNotificationsRead: '/notifications/read-all',
  unreadNotificationCount: '/notifications/unread-count',
  
  // Search endpoints
  search: (query: string, type?: string) => 
    `/search?query=${encodeURIComponent(query)}${type ? `&type=${type}` : ''}`,
  searchPosts: (query: string) => `/search/posts?query=${encodeURIComponent(query)}`,
  searchUsers: (query: string) => `/search/users?query=${encodeURIComponent(query)}`,
  
  // Upload endpoints
  uploadImage: '/upload/image',
};

/**
 * Generic API request function with authentication
 * @param endpoint - API endpoint
 * @param method - HTTP method
 * @param data - Request body data
 * @returns Response data
 */
export async function apiRequest<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<T> {
  const token = getAccessToken();
  
  // Build request options
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  };
  
  // Add request body for non-GET requests
  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }
  
  try {
    // Make the request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    // Handle 401 Unauthorized (token expired)
    if (response.status === 401) {
      try {
        console.log('Attempting to refresh token in apiRequest due to 401 response');
        // Try to refresh the token
        const { accessToken } = await refreshAccessToken();
        
        // Update the authorization header and retry
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`
        };
        
        console.log('Token refreshed successfully in apiRequest, retrying original request');
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (!retryResponse.ok) {
          const errorData = await retryResponse.json().catch(() => ({}));
          throw new Error(errorData.message || `API request failed with status ${retryResponse.status}`);
        }
        
        return await retryResponse.json();
      } catch (refreshError: any) {
        console.error('Token refresh failed in apiRequest:', refreshError.message);
        
        // Only clear tokens for authentication errors (401, 403)
        if (refreshError.response && (
            refreshError.response.status === 401 || 
            refreshError.response.status === 403
          )) {
          console.log('Authentication error during token refresh in apiRequest, clearing tokens');
          clearTokens();
        } else {
          console.log('Non-authentication error during token refresh in apiRequest, keeping tokens');
        }
        
        throw refreshError;
      }
    }
    
    // Handle other non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }
    
    // Parse and return response data
    return await response.json();
  } catch (error: any) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.error('Network error in apiRequest:', error.message);
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    // Re-throw other errors
    throw error;
  }
}

// User API endpoints
export const userApi = {
  /**
   * Get current user profile
   * @returns User profile data
   */
  getCurrentUser: () => apiRequest(endpoints.profile),
  
  /**
   * Get user by ID
   * @param userId - User ID
   * @returns User data
   */
  getUserById: (userId: string) => apiRequest(endpoints.user(userId)),
  
  /**
   * Get user by username
   * @param username - Username
   * @returns User data
   */
  getUserByUsername: (username: string) => apiRequest(endpoints.userByUsername(username)),
  
  /**
   * Update user profile
   * @param userData - Updated user data
   * @returns Updated user data
   */
  updateProfile: (userData: any) => apiRequest(endpoints.profile, 'PUT', userData),
};

// Post API endpoints
export const postApi = {
  /**
   * Get all posts
   * @param filter - Optional filter (e.g., 'feed', 'bookmarks')
   * @param page - Page number for pagination
   * @param limit - Number of posts per page
   * @returns List of posts
   */
  getPosts: (filter?: string, page = 1, limit = 10) => 
    apiRequest(`${endpoints.posts}?filter=${filter || ''}&page=${page}&limit=${limit}`),
  
  /**
   * Get a post by ID
   * @param postId - Post ID
   * @returns Post data
   */
  getPostById: (postId: string) => apiRequest(endpoints.post(postId)),
  
  /**
   * Get posts by a specific user
   * @param userId - User ID
   * @param page - Page number for pagination
   * @param limit - Number of posts per page
   * @returns List of posts
   */
  getPostsByUser: (userId: string, page = 1, limit = 10) => 
    apiRequest(`${endpoints.userPosts(userId)}?page=${page}&limit=${limit}`),
  
  /**
   * Create a new post
   * @param postData - Post data
   * @returns Created post data
   */
  createPost: (postData: any) => apiRequest(endpoints.posts, 'POST', postData),
  
  /**
   * Update a post
   * @param postId - Post ID
   * @param postData - Updated post data
   * @returns Updated post data
   */
  updatePost: (postId: string, postData: any) => 
    apiRequest(endpoints.post(postId), 'PUT', postData),
  
  /**
   * Delete a post
   * @param postId - Post ID
   * @returns Success status
   */
  deletePost: (postId: string) => apiRequest(endpoints.post(postId), 'DELETE'),
  
  /**
   * Like a post
   * @param postId - Post ID
   * @returns Updated like status
   */
  likePost: (postId: string) => apiRequest(endpoints.likePost(postId), 'POST'),
  
  /**
   * Unlike a post
   * @param postId - Post ID
   * @returns Updated like status
   */
  unlikePost: (postId: string) => apiRequest(endpoints.unlike(postId), 'POST'),
  
  /**
   * Bookmark a post
   * @param postId - Post ID
   * @returns Updated bookmark status
   */
  bookmarkPost: (postId: string) => apiRequest(endpoints.bookmark(postId), 'POST'),
  
  /**
   * Remove bookmark from a post
   * @param postId - Post ID
   * @returns Updated bookmark status
   */
  unbookmarkPost: (postId: string) => apiRequest(endpoints.unbookmark(postId), 'POST'),
  
  /**
   * Get posts by tag
   * @param tag - Tag name
   * @param page - Page number for pagination
   * @param limit - Number of posts per page
   * @returns List of posts
   */
  getPostsByTag: (tag: string, page = 1, limit = 10) => 
    apiRequest(`${endpoints.tagPosts(tag)}?page=${page}&limit=${limit}`)
};

// Comment API endpoints
export const commentApi = {
  /**
   * Get comments for a post
   * @param postId - Post ID
   * @returns List of comments
   */
  getComments: (postId: string) => apiRequest(endpoints.comments(postId)),
  
  /**
   * Add a comment to a post
   * @param postId - Post ID
   * @param content - Comment content
   * @returns Created comment data
   */
  addComment: (postId: string, content: string) => 
    apiRequest(endpoints.comments(postId), 'POST', { content }),
  
  /**
   * Reply to a comment
   * @param postId - Post ID
   * @param commentId - Parent comment ID
   * @param content - Reply content
   * @returns Created reply data
   */
  replyToComment: (postId: string, commentId: string, content: string) => 
    apiRequest(endpoints.replies(postId, commentId), 'POST', { content }),
  
  /**
   * Delete a comment
   * @param postId - Post ID
   * @param commentId - Comment ID
   * @returns Success status
   */
  deleteComment: (postId: string, commentId: string) => 
    apiRequest(endpoints.comment(postId, commentId), 'DELETE'),
  
  /**
   * Like a comment
   * @param postId - Post ID
   * @param commentId - Comment ID
   * @returns Updated like status
   */
  likeComment: (postId: string, commentId: string) => 
    apiRequest(endpoints.likeComment(postId, commentId), 'POST'),
  
  /**
   * Unlike a comment
   * @param postId - Post ID
   * @param commentId - Comment ID
   * @returns Updated like status
   */
  unlikeComment: (postId: string, commentId: string) => 
    apiRequest(endpoints.unlikeComment(postId, commentId), 'POST')
};

// Upload API endpoints
export const uploadApi = {
  /**
   * Upload an image
   * @param file - Image file
   * @returns Uploaded image URL
   */
  uploadImage: async (file: File): Promise<string> => {
    const token = getAccessToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_BASE_URL}${endpoints.uploadImage}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Upload failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return data.url;
  }
};

// Social API endpoints
export const socialApi = {
  /**
   * Follow a user
   * @param userId - User ID to follow
   * @returns Success status
   */
  followUser: (userId: string) => apiRequest(endpoints.follow(userId), 'POST'),
  
  /**
   * Unfollow a user
   * @param userId - User ID to unfollow
   * @returns Success status
   */
  unfollowUser: (userId: string) => apiRequest(endpoints.unfollow(userId), 'DELETE'),
  
  /**
   * Get followers of a user
   * @param userId - User ID
   * @param page - Page number for pagination
   * @param limit - Number of followers per page
   * @returns List of followers
   */
  getFollowers: (userId: string, page = 1, limit = 10) => 
    apiRequest(`${endpoints.followers(userId)}?page=${page}&limit=${limit}`),
  
  /**
   * Get users followed by a user
   * @param userId - User ID
   * @param page - Page number for pagination
   * @param limit - Number of following per page
   * @returns List of following
   */
  getFollowing: (userId: string, page = 1, limit = 10) => 
    apiRequest(`${endpoints.following(userId)}?page=${page}&limit=${limit}`),
  
  /**
   * Get user stats (followers count, following count, posts count)
   * @param userId - User ID
   * @returns User stats
   */
  getUserStats: (userId: string) => apiRequest(`/social/stats/${userId}`),
  
  /**
   * Get suggested users to follow
   * @param limit - Number of suggestions
   * @returns List of suggested users
   */
  getSuggestedUsers: (limit = 5) => apiRequest(`/social/suggestions?limit=${limit}`),
  
  /**
   * Check if a user is following another user
   * @param userId - User ID to check
   * @returns Follow status
   */
  checkFollowStatus: (userId: string) => apiRequest(`/social/follow/check/${userId}`)
};

// Search API endpoints
export const searchApi = {
  /**
   * Search for posts and users
   * @param query - Search query
   * @param type - Optional search type ('all', 'posts', or 'users')
   * @param page - Page number for pagination
   * @param limit - Number of results per page
   * @returns Search results
   */
  search: (query: string, type?: 'all' | 'posts' | 'users', page = 1, limit = 10) => 
    apiRequest(`${endpoints.search(query, type)}&page=${page}&limit=${limit}`),
  
  /**
   * Search for posts
   * @param query - Search query
   * @param page - Page number for pagination
   * @param limit - Number of results per page
   * @returns List of posts matching the query
   */
  searchPosts: (query: string, page = 1, limit = 10) => 
    apiRequest(`${endpoints.searchPosts(query)}&page=${page}&limit=${limit}`),
  
  /**
   * Search for users
   * @param query - Search query
   * @param page - Page number for pagination
   * @param limit - Number of results per page
   * @returns List of users matching the query
   */
  searchUsers: (query: string, page = 1, limit = 10) => 
    apiRequest(`${endpoints.searchUsers(query)}&page=${page}&limit=${limit}`)
};

// Notification API endpoints
export const notificationApi = {
  /**
   * Get user notifications
   * @param page - Page number for pagination
   * @param limit - Number of notifications per page
   * @returns List of notifications
   */
  getNotifications: (page = 1, limit = 20) => 
    apiRequest(`${endpoints.notifications}?page=${page}&limit=${limit}`),
  
  /**
   * Mark a notification as read
   * @param notificationId - Notification ID
   * @returns Success status
   */
  markAsRead: (notificationId: string) => 
    apiRequest(endpoints.markNotificationRead(notificationId), 'PUT'),
  
  /**
   * Mark all notifications as read
   * @returns Success status
   */
  markAllAsRead: () => apiRequest(endpoints.markAllNotificationsRead, 'PUT'),
  
  /**
   * Delete a notification
   * @param notificationId - Notification ID
   * @returns Success status
   */
  deleteNotification: (notificationId: string) => 
    apiRequest(endpoints.notification(notificationId), 'DELETE'),
    
  /**
   * Get unread notification count
   * @returns Unread notification count
   */
  getUnreadCount: () => apiRequest(endpoints.unreadNotificationCount),
};

// Export default api instance for use in other files
export default api;
