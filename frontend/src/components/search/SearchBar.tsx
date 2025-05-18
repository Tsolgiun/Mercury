import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchApi } from '../../lib/api';
import { debounce } from '../../lib/utils';

interface SearchResult {
  posts: any[];
  users: any[];
}

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Debounced search function to avoid too many API calls
  const debouncedSearch = useRef(
    debounce(async (searchQuery: string) => {
      if (searchQuery.trim().length < 2) {
        setResults(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await searchApi.search(searchQuery);
        setResults(response.results);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300)
  ).current;

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus input when search is opened
  useEffect(() => {
    if (isOpen) {
      const input = searchRef.current?.querySelector('input');
      if (input) {
        input.focus();
      }
    }
  }, [isOpen]);

  // Navigate to post or user profile
  const handleResultClick = (type: 'post' | 'user', id: string) => {
    setIsOpen(false);
    setQuery('');
    setResults(null);
    
    if (type === 'post') {
      navigate(`/post/${id}`);
    } else {
      navigate(`/profile/${id}`);
    }
  };

  // Handle search form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length > 0) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Search icon button (visible on mobile) */}
      <button
        className="md:hidden p-2 text-fg hover:text-muted focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Search"
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
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>

      {/* Search input (always visible on desktop) */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:block`}>
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            className="w-full md:w-64 px-4 py-2 pl-10 bg-bg border border-outline rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          {loading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}
        </form>

        {/* Search results dropdown */}
        {isOpen && query.trim().length > 0 && (
          <div className="absolute z-20 mt-2 w-full md:w-96 bg-bg border border-outline rounded-md shadow-lg max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-muted">Searching...</div>
            ) : results ? (
              <div>
                {/* Users section */}
                {results.users.length > 0 && (
                  <div className="p-2">
                    <h3 className="text-xs font-semibold text-muted uppercase px-2 py-1">Users</h3>
                    {results.users.map((user) => (
                      <div
                        key={user._id}
                        className="px-2 py-2 hover:bg-hover cursor-pointer rounded-md"
                        onClick={() => handleResultClick('user', user._id)}
                      >
                        <div className="flex items-center">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-8 h-8 rounded-full mr-2"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-outline flex items-center justify-center mr-2">
                              <span className="text-muted">{user.name.charAt(0).toUpperCase()}</span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted">@{user.username}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Posts section */}
                {results.posts.length > 0 && (
                  <div className="p-2">
                    <h3 className="text-xs font-semibold text-muted uppercase px-2 py-1">Posts</h3>
                    {results.posts.map((post) => (
                      <div
                        key={post._id}
                        className="px-2 py-2 hover:bg-hover cursor-pointer rounded-md"
                        onClick={() => handleResultClick('post', post._id)}
                      >
                        <div className="font-medium">
                          {post.title || post.blocks[0]?.content?.substring(0, 50) || 'Untitled post'}
                        </div>
                        <div className="text-sm text-muted flex items-center">
                          <span>By {post.author.name}</span>
                          <span className="mx-1">•</span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No results */}
                {results.users.length === 0 && results.posts.length === 0 && (
                  <div className="p-4 text-center text-muted">No results found</div>
                )}

                {/* View all results link */}
                {(results.users.length > 0 || results.posts.length > 0) && (
                  <div className="p-2 border-t border-outline">
                    <button
                      className="w-full text-center py-2 text-primary hover:underline"
                      onClick={handleSubmit}
                    >
                      View all results
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-center text-muted">Type to search</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
