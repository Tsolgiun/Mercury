import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { endpoints } from '../lib/api';
import { useAuth } from '../hooks/use-auth';

// Define post types
export type PostType = 'short' | 'long';

export interface Block {
  type: 'paragraph' | 'heading' | 'image' | 'list' | 'quote' | 'code';
  content?: string;
  level?: number; // For headings
  items?: string[]; // For lists
  url?: string; // For images
  language?: string; // For code blocks
}

export interface Post {
  _id: string;
  type: PostType;
  title?: string;
  blocks: Block[];
  author: {
    _id: string;
    name: string;
    username?: string;
    avatar?: string;
  };
  tags: string[];
  coverImage?: string;
  readingTime: number;
  likes: number;
  comments: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Define post context type
interface PostContextType {
  posts: Post[];
  loading: boolean;
  error: string | null;
  fetchPosts: (type?: 'feed' | 'discover' | 'following' | 'bookmarks') => Promise<void>;
  fetchPostById: (id: string) => Promise<Post | null>;
  fetchPostsByUser: (userId: string) => Promise<Post[]>;
  fetchPostsByTag: (tag: string) => Promise<Post[]>;
  createPost: (postData: Partial<Post>) => Promise<Post>;
  updatePost: (id: string, postData: Partial<Post>) => Promise<Post>;
  deletePost: (id: string) => Promise<void>;
  toggleLike: (id: string) => Promise<void>;
  toggleBookmark: (id: string) => Promise<void>;
}

// Create post context
const PostContext = createContext<PostContextType | undefined>(undefined);

// Post provider component
export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  // Fetch posts based on type (memoized to prevent infinite loops)
  const fetchPosts = useCallback(async (type: 'feed' | 'discover' | 'following' | 'bookmarks' = 'feed') => {
    setLoading(true);
    setError(null);
    
    try {
      let endpoint = endpoints.posts;
      
      switch (type) {
        case 'discover':
          endpoint = endpoints.discoverPosts;
          break;
        case 'following':
          endpoint = endpoints.followingPosts;
          break;
        case 'bookmarks':
          endpoint = endpoints.bookmarkedPosts;
          break;
        default:
          endpoint = endpoints.posts;
      }
      
    const response = await api.get(endpoint);
    setPosts(response.data.posts);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      setError(error.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setPosts]);

  // Fetch a single post by ID (memoized to prevent infinite loops)
  const fetchPostById = useCallback(async (id: string): Promise<Post | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(endpoints.post(id));
      return response.data.post;
    } catch (error: any) {
      console.error(`Error fetching post ${id}:`, error);
      setError(error.message || 'Failed to fetch post');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Fetch posts by user (memoized to prevent infinite loops)
  const fetchPostsByUser = useCallback(async (userId: string): Promise<Post[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(endpoints.userPosts(userId));
      return response.data.posts;
    } catch (error: any) {
      console.error(`Error fetching posts for user ${userId}:`, error);
      setError(error.message || 'Failed to fetch user posts');
      return [];
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Fetch posts by tag (memoized to prevent infinite loops)
  const fetchPostsByTag = useCallback(async (tag: string): Promise<Post[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(endpoints.tagPosts(tag));
      return response.data.posts;
    } catch (error: any) {
      console.error(`Error fetching posts for tag ${tag}:`, error);
      setError(error.message || 'Failed to fetch tagged posts');
      return [];
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Create a new post (memoized to prevent infinite loops)
  const createPost = useCallback(async (postData: Partial<Post>): Promise<Post> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(endpoints.posts, postData);
      setPosts(prevPosts => [response.data, ...prevPosts]);
      return response.data;
    } catch (error: any) {
      console.error('Error creating post:', error);
      setError(error.message || 'Failed to create post');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setPosts]);

  // Update an existing post (memoized to prevent infinite loops)
  const updatePost = useCallback(async (id: string, postData: Partial<Post>): Promise<Post> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.put(endpoints.post(id), postData);
      setPosts(prevPosts => 
        prevPosts.map(post => post._id === id ? response.data : post)
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error updating post ${id}:`, error);
      setError(error.message || 'Failed to update post');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setPosts]);

  // Delete a post (memoized to prevent infinite loops)
  const deletePost = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await api.delete(endpoints.post(id));
      setPosts(prevPosts => prevPosts.filter(post => post._id !== id));
    } catch (error: any) {
      console.error(`Error deleting post ${id}:`, error);
      setError(error.message || 'Failed to delete post');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setPosts]);  // Toggle like on a post (memoized to prevent infinite loops)
  const toggleLike = useCallback(async (id: string): Promise<void> => {
    if (!currentUser) return;
    
    // Store the current like state before making the API call
    const post = posts.find(p => p._id === id);
    const wasLiked = post?.isLiked || false;
    
    try {
      // First update UI optimistically for better user experience
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === id) {
            const isLiked = !post.isLiked;
            const likeDelta = isLiked ? 1 : -1;
            return {
              ...post,
              isLiked,
              likes: post.likes + likeDelta
            };
          }
          return post;
        })
      );
      
      // Then make the API call
      console.log(`Attempting to toggle like for post ${id}`);
      console.log(`User ID: ${currentUser._id}`);
      console.log(`API endpoint: ${endpoints.likePost(id)}`);
      
      try {
        const response = await api.post(endpoints.likePost(id));
        console.log('Like API response:', response.data);
      } catch (apiError: any) {
        console.error('Detailed Like API error:');
        if (apiError.response) {
          console.error('- Status:', apiError.response.status);
          console.error('- Data:', apiError.response.data);
          console.error('- Headers:', apiError.response.headers);
        } else if (apiError.request) {
          console.error('- No response received from server');
          console.error('- Request:', apiError.request);
        } else {
          console.error('- Message:', apiError.message);
        }
        throw apiError;
      }
    } catch (error: any) {
      console.error(`Error toggling like for post ${id}:`, error);
      
      // If the API call fails, revert the UI change
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === id) {
            return {
              ...post,
              isLiked: wasLiked,
              likes: post.likes + (wasLiked ? 0 : -1)
            };
          }
          return post;
        })
      );
      
      setError(error.message || 'Failed to like/unlike post');
      throw error;}
  }, [currentUser, posts, setPosts, setError]);

  // Toggle bookmark on a post (memoized to prevent infinite loops)
  const toggleBookmark = useCallback(async (id: string): Promise<void> => {
    if (!currentUser) return;
    
    // Store the current bookmark state before making the API call
    const post = posts.find(p => p._id === id);
    const wasBookmarked = post?.isBookmarked || false;
    
    try {
      // First update UI optimistically for better user experience
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === id) {
            return {
              ...post,
              isBookmarked: !post.isBookmarked
            };
          }
          return post;
        })
      );
      
      // Then make the API call
      await api.post(endpoints.bookmark(id));
    } catch (error: any) {
      console.error(`Error toggling bookmark for post ${id}:`, error);
      
      // If the API call fails, revert the UI change
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === id) {
            return {
              ...post,
              isBookmarked: wasBookmarked
            };
          }
          return post;
        })
      );
      
      // Only set the error message, don't throw the error
      // This prevents the auth-error event from being triggered
      setError(error.message || 'Failed to bookmark/unbookmark post');
      
      // Check if it's an authentication error but don't throw
      if (error.response?.status === 401) {
        console.warn('Authentication error when bookmarking, but not logging out user');
      }
    }
  }, [currentUser, posts, setPosts, setError]);

  // Load initial posts
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Refetch posts when authentication state changes
  useEffect(() => {
    if (currentUser) {
      // User has logged in, refetch posts
      fetchPosts();
    }
  }, [currentUser, fetchPosts]);

  const value = {
    posts,
    loading,
    error,
    fetchPosts,
    fetchPostById,
    fetchPostsByUser,
    fetchPostsByTag,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
    toggleBookmark,
  };

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
};

// Custom hook to use post context
export const usePostContext = () => {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error('usePostContext must be used within a PostProvider');
  }
  return context;
};
