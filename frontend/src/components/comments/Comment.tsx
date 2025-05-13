import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth';
import { formatRelativeTime } from '../../lib/utils';

interface CommentUser {
  _id: string;
  name: string;
  avatar?: string;
}

interface CommentProps {
  comment: {
    _id: string;
    content: string;
    user: CommentUser;
    createdAt: string;
    likes: number;
    isLiked?: boolean;
    replies?: CommentType[];
  };
  isReply?: boolean;
}

interface CommentType {
  _id: string;
  content: string;
  user: CommentUser;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  replies?: CommentType[];
}

const Comment: React.FC<CommentProps> = ({ comment, isReply = false }) => {
  const { currentUser } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState(false);
  
  // Handle like button click
  const handleLikeClick = () => {
    // In a real app, this would call an API to like/unlike the comment
    console.log('Like comment:', comment._id);
  };
  
  // Handle reply form submission
  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyContent.trim()) return;
    
    // In a real app, this would call an API to post the reply
    console.log('Reply to comment:', comment._id, replyContent);
    
    // Reset form
    setReplyContent('');
    setIsReplying(false);
  };

  return (
    <div className={`comment ${isReply ? 'ml-12 mt-4' : ''}`}>
      <div className="flex">
        {/* Author avatar */}
        <Link to={`/profile/${comment.user._id}`} className="flex-shrink-0 mr-3">
          {comment.user.avatar ? (
            <img 
              src={comment.user.avatar} 
              alt={comment.user.name} 
              className="avatar-sm"
            />
          ) : (
            <div className="avatar-sm bg-outline flex items-center justify-center text-muted">
              {comment.user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>
        
        {/* Comment content */}
        <div className="flex-1">
          <div className="bg-hover rounded-lg p-3">
            {/* Author and timestamp */}
            <div className="flex items-center mb-1">
              <Link 
                to={`/profile/${comment.user._id}`} 
                className="font-medium hover:underline"
              >
                {comment.user.name}
              </Link>
              <span className="mx-1 text-muted">·</span>
              <span className="text-xs text-muted">
                {formatRelativeTime(comment.createdAt)}
              </span>
            </div>
            
            {/* Comment text */}
            <p className="text-sm">{comment.content}</p>
          </div>
          
          {/* Comment actions */}
          <div className="flex items-center mt-1 text-xs text-muted">
            {/* Like button */}
            <button 
              className="flex items-center mr-4 hover:text-fg"
              onClick={handleLikeClick}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-4 w-4 mr-1 ${comment.isLiked ? 'fill-fg' : 'stroke-current'}`} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <span>{comment.likes}</span>
            </button>
            
            {/* Reply button */}
            {!isReply && currentUser && (
              <button 
                className="hover:text-fg"
                onClick={() => setIsReplying(!isReplying)}
              >
                Reply
              </button>
            )}
            
            {/* Show replies button */}
            {!isReply && comment.replies && comment.replies.length > 0 && (
              <button 
                className="ml-4 hover:text-fg"
                onClick={() => setShowReplies(!showReplies)}
              >
                {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>
          
          {/* Reply form */}
          {isReplying && (
            <form onSubmit={handleReplySubmit} className="mt-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-outline rounded-md focus:outline-none focus:ring-1 focus:ring-fg"
                placeholder="Write a reply..."
                rows={2}
              ></textarea>
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  className="text-sm text-muted hover:text-fg mr-2"
                  onClick={() => setIsReplying(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-sm btn-sm"
                  disabled={!replyContent.trim()}
                >
                  Reply
                </button>
              </div>
            </form>
          )}
          
          {/* Replies */}
          {!isReply && showReplies && comment.replies && (
            <div className="mt-2">
              {comment.replies.map((reply) => (
                <Comment key={reply._id} comment={reply} isReply={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comment;
