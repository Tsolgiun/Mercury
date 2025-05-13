import React, { useEffect, useState } from 'react';
import { usePost } from '../hooks/use-post';
import { useAuth } from '../hooks/use-auth';
import FeedCard from '../components/feed/FeedCard';
import { Post } from '../context/PostContext';
import { Link } from 'react-router-dom';

const Bookmarks: React.FC = () => {
  const { fetchPosts, posts: contextPosts } = usePost();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch bookmarked posts
  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        setLoading(true);
        setError(null);
        await fetchPosts('bookmarks');
      } catch (error: any) {
        console.error('Error fetching bookmarks:', error);
        setError(error.message || 'Failed to load bookmarks');
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      loadBookmarks();
    }
  }, [currentUser, fetchPosts]);
  
  // If not logged in, show login prompt
  if (!currentUser) {
    return (
      <div className="container-narrow py-12">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl font-bold mb-4">Bookmarks</h1>
          <p className="mb-6">Please log in to view your bookmarked posts.</p>
          <Link to="/login" className="btn">
            Log in
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container-narrow py-8">
      <h1 className="text-2xl font-bold mb-6">Your Bookmarks</h1>
      
      {loading ? (
        <div className="py-8 text-center">
          <p>Loading bookmarks...</p>
        </div>
      ) : error ? (
        <div className="py-8 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn"
          >
            Try again
          </button>
        </div>
      ) : contextPosts.length > 0 ? (
        <div className="space-y-6">
          {contextPosts.map((post) => (
            <FeedCard key={post._id} post={post} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-muted mb-6">You haven't bookmarked any posts yet.</p>
          <Link to="/" className="btn">
            Explore posts
          </Link>
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
