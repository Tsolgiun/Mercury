import React from 'react';
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
  const { toggleLike, toggleBookmark } = usePost();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  // Extract first paragraph for preview
  const previewText = post.blocks.find(block => block.type === 'paragraph')?.content || '';
  
  // Handle like button click
  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentUser) {
      toggleLike(post._id);
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

  return (
    <div onClick={handleCardClick} className="feed-card block cursor-pointer">
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
          {/* Author and timestamp */}
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
