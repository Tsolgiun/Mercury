import React, { useState, useEffect } from 'react';
import { usePost } from '../hooks/use-post';
import { useMobile } from '../hooks/use-mobile';
import Feed from '../components/feed/Feed';

// Feed type options
type FeedType = 'all' | 'discover' | 'following';

const Home: React.FC = () => {
  const [feedType, setFeedType] = useState<FeedType>('all');
  const { posts, loading, error, fetchPosts } = usePost();
  const isMobile = useMobile();

  // Fetch posts based on selected feed type
  useEffect(() => {
    const fetchFeed = async () => {
      switch (feedType) {
        case 'discover':
          await fetchPosts('discover');
          break;
        case 'following':
          await fetchPosts('following');
          break;
        default:
          await fetchPosts('feed');
      }
    };

    fetchFeed();
  }, [feedType, fetchPosts]);

  return (
    <div className="container-narrow py-6">
      {/* Feed type selector */}
      <div className="flex justify-center mb-6 border-b border-outline">
        <button
          className={`px-4 py-2 font-medium ${
            feedType === 'all' ? 'border-b-2 border-fg' : 'text-muted'
          }`}
          onClick={() => setFeedType('all')}
        >
          For You
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            feedType === 'discover' ? 'border-b-2 border-fg' : 'text-muted'
          }`}
          onClick={() => setFeedType('discover')}
        >
          Discover
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            feedType === 'following' ? 'border-b-2 border-fg' : 'text-muted'
          }`}
          onClick={() => setFeedType('following')}
        >
          Following
        </button>
      </div>

      {/* Feed content */}
      {loading ? (
        <div className="flex justify-center py-8">
          <p>Loading posts...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <Feed posts={posts} />
      )}

      {/* Empty state */}
      {!loading && !error && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl font-semibold mb-2">No posts yet</h2>
          {feedType === 'following' ? (
            <p className="text-muted text-center max-w-md">
              Follow more users to see their posts in your feed.
            </p>
          ) : (
            <p className="text-muted text-center max-w-md">
              Be the first to share your thoughts with the community.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
