import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Post } from '../../context/PostContext';
import { usePost } from '../../hooks/use-post';
import { useAuth } from '../../hooks/use-auth';
import { formatRelativeTime, truncateText } from '../../lib/utils';
import { useToast } from '../../hooks/use-toast';

interface FeedCardProps {
  post: Post;
}

const FeedCard: React.FC<FeedCardProps> = ({ post }) => {
  const { toggleLike, toggleBookmark, deletePost } = usePost();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [showOptions, setShowOptions] = useState(false);
  
  // Check if the current user is the author of the post
  const isAuthor = currentUser && currentUser._id === post.author._id;
  
  // Extract first paragraph for preview
  const previewText = post.blocks.find(block => block.type === 'paragraph')?.content || '';
    // Handle like button click
  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentUser) {
      try {
        toggleLike(post._id).catch(error => {
          // Show a user-friendly error message
          showToast(
            error.message || 'Failed to like post. Please try again later.',
            'error'
          );
        });
      } catch (error: any) {
        // Error handling is done in the toggleLike function
        // This is just a safeguard
        showToast(
          error.message || 'Failed to like post. Please try again later.',
          'error'
        );
      }
    } else {
      // If no user is logged in, show a toast notification
      showToast('Please log in to like posts', 'info');
    }
  };
  
  // Handle bookmark button click
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (currentUser) {
      try {
        toggleBookmark(post._id).catch(error => {
          // Show a user-friendly error message
          showToast(
            error.message || 'Failed to bookmark post. Please try again later.',
            'error'
          );
        });
      } catch (error: any) {
        // Error handling is done in the toggleBookmark function
        // This is just a safeguard
        showToast(
          error.message || 'Failed to bookmark post. Please try again later.',
          'error'
        );
      }
    } else {
      // If no user is logged in, show a toast notification
      showToast('Please log in to bookmark posts', 'info');
    }
  };

  // Handle card click to navigate to post detail
  const handleCardClick = () => {
    navigate(`/post/${post._id}`);
  };
  
  // Handle edit post
  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/editor?edit=${post._id}`);
  };
  
  // Handle delete post
  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        await deletePost(post._id);
        showToast('Post deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting post:', error);
        showToast('Failed to delete post', 'error');
      }
    }
  };
  
  // Toggle options menu
  const toggleOptions = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowOptions(!showOptions);
  };

  return (
    <div onClick={handleCardClick} className="feed-card block cursor-pointer relative">
      <div className="flex items-start">
        {/* Author avatar */}
        <Link 
          to={`/profile/${post.author._id}`} 
          className="flex-shrink-0 mr-3"
          onClick={(e) => e.stopPropagation()}
        >
          {post.author.avatar ? (
            <img 
              src={post.author.avatar} 
              alt={post.author.name} 
              className="avatar-md"
            />
          ) : (
            <div className="avatar-md bg-outline flex items-center justify-center text-muted">
              {post.author.name.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>
        
        {/* Post content */}
        <div className="flex-1">
          {/* Author, timestamp, and options */}
          <div className="flex items-center mb-1">
            <Link 
              to={`/profile/${post.author._id}`} 
              className="font-medium hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {post.author.name}
            </Link>
            <span className="mx-1 text-muted">·</span>
            <span className="text-sm text-muted">
              {formatRelativeTime(post.createdAt)}
            </span>
            
            {/* Post options for author */}
            {isAuthor && (
              <div className="relative ml-auto">
                <button 
                  onClick={toggleOptions}
                  className="text-muted hover:text-fg p-1"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" 
                    />
                  </svg>
                </button>
                
                {/* Options dropdown */}
                {showOptions && (
                  <div 
                    className="absolute right-0 top-full mt-1 bg-fg-alt shadow-md rounded-md z-10 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                      onClick={handleEditClick}
                      className="flex items-center w-full px-4 py-2 text-sm hover:bg-hover"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-4 w-4 mr-2" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                        />
                      </svg>
                      Edit
                    </button>
                    <button 
                      onClick={handleDeleteClick}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-hover"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-4 w-4 mr-2" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                        />
                      </svg>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Post title for long posts */}
          {post.type === 'long' && post.title && (
            <h2 className="text-title font-semibold mb-1">{post.title}</h2>
          )}
          
          {/* Post preview */}
          <div className="mb-2">
            <p>{truncateText(previewText, 150)}</p>
          </div>
          
          {/* Cover image if available */}
          {post.coverImage && (
            <div className="mb-3">
              <img 
                src={post.coverImage} 
                alt="Post cover" 
              className="max-w-[60%] rounded"
              />
            </div>
          )}
          
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.tags.slice(0, 3).map((tag) => (
                <Link
                  key={tag}
                  to={`/tag/${tag}`}
                  className="text-xs bg-hover px-2 py-1 rounded hover:bg-outline"
                  onClick={(e) => e.stopPropagation()}
                >
                  #{tag}
                </Link>
              ))}
              {post.tags.length > 3 && (
                <span className="text-xs text-muted">+{post.tags.length - 3}</span>
              )}
            </div>
          )}
          
          {/* Post actions */}
          <div className="flex items-center text-sm text-muted">
            {/* Like button */}
            <button 
              className="flex items-center mr-4 hover:text-fg"
              onClick={handleLikeClick}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 mr-1 ${post.isLiked ? 'fill-fg' : 'stroke-current'}`} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <span>{post.likes}</span>
            </button>
            
            {/* Comment button */}
            <Link 
              to={`/post/${post._id}`} 
              className="flex items-center mr-4 hover:text-fg"
              onClick={(e) => e.stopPropagation()}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-1" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              <span>{post.comments}</span>
            </Link>
            
            {/* Bookmark button */}
            <button 
              className="flex items-center hover:text-fg ml-auto"
              onClick={handleBookmarkClick}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 ${post.isBookmarked ? 'fill-fg' : 'stroke-current'}`} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedCard;
