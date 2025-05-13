import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePost } from '../hooks/use-post';
import { useAuth } from '../hooks/use-auth';
import ArticleView from '../components/article/ArticleView';
import Comment from '../components/comments/Comment';
import { getToast } from '../hooks/use-toast';
import { formatRelativeTime } from '../lib/utils';
import { Post as PostType } from '../context/PostContext';
import { commentApi } from '../lib/api';

const Post: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { 
    fetchPostById, 
    toggleLike, 
    toggleBookmark
  } = usePost();
  
  const [post, setPost] = useState<PostType | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  
  // Fetch post data
  useEffect(() => {
    const loadPost = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const postData = await fetchPostById(id);
        setPost(postData);
      } catch (error: any) {
        console.error('Error fetching post:', error);
        setError(error.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    
    loadPost();
  }, [id, fetchPostById]);
  
  // Fetch comments
  useEffect(() => {
    const loadComments = async () => {
      if (!id) return;
      
      try {
        setCommentLoading(true);
        // Fetch comments from the API
        const commentsData = await commentApi.getComments(id);
        setComments(commentsData.comments || []);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setCommentLoading(false);
      }
    };
    
    if (post) {
      loadComments();
    }
  }, [id, post]);
  
  // Handle like/unlike
  const handleLikeToggle = async () => {
    if (!currentUser) {
      getToast()?.showToast('Please log in to like posts', 'info');
      return;
    }
    
    if (!post || !id) return;
    
    try {
      await toggleLike(id);
      setPost({
        ...post,
        isLiked: !post.isLiked,
        likes: post.isLiked ? post.likes - 1 : post.likes + 1
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      getToast()?.showToast('Failed to update like status', 'error');
    }
  };
  
  // Handle bookmark/unbookmark
  const handleBookmarkToggle = async () => {
    if (!currentUser) {
      getToast()?.showToast('Please log in to bookmark posts', 'info');
      return;
    }
    
    if (!post || !id) return;
    
    // Store the current bookmark state before making the API call
    const wasBookmarked = post.isBookmarked;
    
    // Update UI optimistically for better user experience
    setPost({
      ...post,
      isBookmarked: !post.isBookmarked
    });
    
    try {
      await toggleBookmark(id);
      
      // Show success message after successful API call
      if (!wasBookmarked) {
        getToast()?.showToast('Added to bookmarks', 'success');
      } else {
        getToast()?.showToast('Removed from bookmarks', 'info');
      }
    } catch (error: any) {
      console.error('Error toggling bookmark:', error);
      
      // Revert UI change if the API call fails
      setPost({
        ...post,
        isBookmarked: wasBookmarked
      });
      
      // Show error message
      getToast()?.showToast(
        error.message || 'Failed to update bookmark status. Please try again.',
        'error'
      );
      
      // Don't throw the error further to prevent logout
    }
  };
  
  // Handle comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      getToast()?.showToast('Please log in to comment', 'info');
      return;
    }
    
    if (!newComment.trim() || !id) return;
    
    try {
      setSubmittingComment(true);
      
      // Call API to add the comment to the database
      const savedComment = await commentApi.addComment(id, newComment);
      
      // Add the new comment to the local state
      setComments([savedComment, ...comments]);
      setNewComment('');
      
      // Update post comment count
      if (post) {
        setPost({
          ...post,
          comments: post.comments + 1
        });
      }
      
      getToast()?.showToast('Comment added successfully', 'success');
    } catch (error) {
      console.error('Error adding comment:', error);
      getToast()?.showToast('Failed to add comment', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container-narrow py-12">
        <div className="flex justify-center">
          <p>Loading post...</p>
        </div>
      </div>
    );
  }
  
  if (error || !post) {
    return (
      <div className="container-narrow py-12">
        <div className="flex flex-col items-center">
          <p className="text-red-500 mb-4">{error || 'Post not found'}</p>
          <button 
            onClick={() => navigate('/')}
            className="btn"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container-narrow py-8">
      {/* Article view */}
      <div>
        {/* Cover image */}
        {post.coverImage && (
          <div className="mb-8">
            <img 
              src={post.coverImage} 
              alt={post.title || 'Cover image'} 
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}
        
        {/* Title for long posts */}
        {post.type === 'long' && post.title && (
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        )}
        
        {/* Author info */}
        <div className="flex items-center mb-6">
          <Link to={`/profile/${post.author._id}`} className="flex items-center">
            {post.author.avatar ? (
              <img 
                src={post.author.avatar} 
                alt={post.author.name} 
                className="w-10 h-10 rounded-full mr-3"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-outline flex items-center justify-center mr-3">
                {post.author.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="font-medium">{post.author.name}</div>
              <div className="text-xs text-muted">
                {formatRelativeTime(post.createdAt)} · {post.readingTime} min read
              </div>
            </div>
          </Link>
          
          {/* Action buttons */}
          <div className="ml-auto flex space-x-2">
            <button 
              onClick={handleLikeToggle}
              className={`p-2 rounded-full hover:bg-hover ${post.isLiked ? 'text-red-500' : ''}`}
              aria-label={post.isLiked ? 'Unlike' : 'Like'}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill={post.isLiked ? 'currentColor' : 'none'} 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                />
              </svg>
            </button>
            <button 
              onClick={handleBookmarkToggle}
              className={`p-2 rounded-full hover:bg-hover ${post.isBookmarked ? 'text-blue-500' : ''}`}
              aria-label={post.isBookmarked ? 'Remove bookmark' : 'Bookmark'}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill={post.isBookmarked ? 'currentColor' : 'none'} 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
                />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag: string, index: number) => (
              <Link 
                key={index} 
                to={`/tag/${tag}`}
                className="text-xs bg-hover px-2 py-1 rounded-full hover:bg-outline"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
        
        {/* Article content */}
        <ArticleView post={post} />
        
        {/* Stats */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-outline text-sm text-muted">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                />
              </svg>
              <span>{post.likes} likes</span>
            </div>
            <div className="flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                />
              </svg>
              <span>{post.comments} comments</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Comments section */}
      <div className="mt-12 border-t border-outline pt-8">
        <h2 className="text-xl font-bold mb-6">Comments</h2>
        
        {/* Comment form */}
        {currentUser && (
          <form onSubmit={handleCommentSubmit} className="mb-8">
            <div className="mb-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-3 border border-outline rounded-md focus:outline-none focus:ring-1 focus:ring-fg"
                rows={3}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="btn"
                disabled={submittingComment || !newComment.trim()}
              >
                {submittingComment ? 'Posting...' : 'Post comment'}
              </button>
            </div>
          </form>
        )}
        
        {/* Comments list */}
        {commentLoading ? (
          <p className="text-center py-4">Loading comments...</p>
        ) : comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map((comment) => (
              <Comment 
                key={comment._id} 
                comment={comment}
              />
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-muted">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

export default Post;
