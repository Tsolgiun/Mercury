import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { searchApi } from '../lib/api';
import { formatDate } from '../lib/utils';
import Feed from '../components/feed/Feed';

interface SearchParams {
  q: string;
  type?: 'all' | 'posts' | 'users';
}

const Search: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'all' | 'posts' | 'users'>('all');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>({ posts: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Parse search params from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const q = searchParams.get('q') || '';
    const type = (searchParams.get('type') as 'all' | 'posts' | 'users') || 'all';
    
    setQuery(q);
    setActiveTab(type);
    setPage(1);
    
    if (q) {
      performSearch(q, type, 1);
    }
  }, [location.search]);

  // Perform search
  const performSearch = async (searchQuery: string, type: 'all' | 'posts' | 'users', page: number) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      switch (type) {
        case 'posts':
          response = await searchApi.searchPosts(searchQuery, page);
          setResults({ ...results, posts: page === 1 ? response.posts : [...results.posts, ...response.posts] });
          setHasMore(page < response.pages);
          break;
        case 'users':
          response = await searchApi.searchUsers(searchQuery, page);
          setResults({ ...results, users: page === 1 ? response.users : [...results.users, ...response.users] });
          setHasMore(page < response.pages);
          break;
        default:
          response = await searchApi.search(searchQuery, 'all', page);
          if (page === 1) {
            setResults(response.results);
          } else {
            setResults({
              posts: [...results.posts, ...(response.results.posts || [])],
              users: [...results.users, ...(response.results.users || [])],
            });
          }
          setHasMore(page < response.pages);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to perform search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load more results
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    performSearch(query, activeTab, nextPage);
  };

  // Change tab
  const handleTabChange = (tab: 'all' | 'posts' | 'users') => {
    setActiveTab(tab);
    setPage(1);
    performSearch(query, tab, 1);
  };

  return (
    <div className="container-narrow py-6 mt-16">
      <h1 className="text-2xl font-bold mb-6">
        Search Results for "{query}"
      </h1>

      {/* Tabs */}
      <div className="flex justify-center mb-6 border-b border-outline">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'all' ? 'border-b-2 border-fg' : 'text-muted'
          }`}
          onClick={() => handleTabChange('all')}
        >
          All
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'posts' ? 'border-b-2 border-fg' : 'text-muted'
          }`}
          onClick={() => handleTabChange('posts')}
        >
          Posts
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'users' ? 'border-b-2 border-fg' : 'text-muted'
          }`}
          onClick={() => handleTabChange('users')}
        >
          Users
        </button>
      </div>

      {/* Search results */}
      {loading && page === 1 ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : error ? (
        <div className="flex justify-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <div>
          {/* Show users if on 'all' or 'users' tab */}
          {(activeTab === 'all' || activeTab === 'users') && results.users && results.users.length > 0 && (
            <div className="mb-8">
              {activeTab === 'all' && <h2 className="text-xl font-semibold mb-4">Users</h2>}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.users.map((user: any) => (
                  <Link
                    to={`/profile/${user._id}`}
                    key={user._id}
                    className="flex items-center p-4 border border-outline rounded-md hover:bg-hover"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-outline flex items-center justify-center mr-4">
                        <span className="text-muted text-lg">{user.name.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted">@{user.username}</div>
                      {user.bio && (
                        <div className="text-sm mt-1 line-clamp-2">{user.bio}</div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              {activeTab === 'all' && results.posts && results.posts.length > 0 && (
                <div className="mt-4 border-b border-outline"></div>
              )}
            </div>
          )}

          {/* Show posts if on 'all' or 'posts' tab */}
          {(activeTab === 'all' || activeTab === 'posts') && results.posts && results.posts.length > 0 && (
            <div>
              {activeTab === 'all' && <h2 className="text-xl font-semibold mb-4">Posts</h2>}
              <Feed posts={results.posts} />
            </div>
          )}

          {/* No results */}
          {((activeTab === 'all' && results.users.length === 0 && results.posts.length === 0) ||
            (activeTab === 'posts' && results.posts.length === 0) ||
            (activeTab === 'users' && results.users.length === 0)) && (
            <div className="flex flex-col items-center justify-center py-12">
              <h2 className="text-xl font-semibold mb-2">No results found</h2>
              <p className="text-muted text-center max-w-md">
                We couldn't find any {activeTab !== 'all' ? activeTab : 'content'} matching your search.
                Try different keywords or check your spelling.
              </p>
            </div>
          )}

          {/* Load more button */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                className="btn"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
