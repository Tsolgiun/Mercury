import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth';
import { useMobile } from '../../hooks/use-mobile';
import { useNotifications } from '../../context/NotificationContext';
import SearchBar from '../search/SearchBar';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { unreadCount } = useNotifications();

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-bg border-b border-outline z-10">
      <div className="container-narrow h-full flex items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="font-semibold text-xl">
          Mercury
        </Link>

        {/* Search Bar */}
        <div className="hidden md:block mx-4 flex-grow max-w-md">
          <SearchBar />
        </div>

        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className="flex items-center space-x-6">
            <Link to="/" className="hover:text-muted">
              Home
            </Link>
            {currentUser && (
              <>
                <Link to="/bookmarks" className="hover:text-muted">
                  Bookmarks
                </Link>
                <Link to="/notifications" className="hover:text-muted relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              </>
            )}
          </nav>
        )}

        {/* Right side actions */}
        <div className="flex items-center">
          {/* Mobile search */}
          <div className="md:hidden mr-2">
            <SearchBar />
          </div>
          
          {/* Write button */}
          {currentUser && (
            <Link
              to="/editor"
              className="btn mr-4 hidden sm:block"
            >
              Write
            </Link>
          )}

          {/* User menu or auth buttons */}
          {currentUser ? (
            <div className="relative">
              {/* User avatar button */}
              <button
                onClick={toggleMenu}
                className="flex items-center focus:outline-none"
              >
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name || 'User'}
                    className="avatar-sm"
                  />
                ) : (
                  <div className="avatar-sm bg-outline flex items-center justify-center text-muted">
                    {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </button>

              {/* Dropdown menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-bg border border-outline rounded-md shadow-lg py-1 z-20">
                  {/* User info */}
                  <div className="px-4 py-2 border-b border-outline">
                    <p className="font-medium">{currentUser.name}</p>
                    <p className="text-sm text-muted truncate">{currentUser.email}</p>
                  </div>

                  {/* Menu items */}
                  <Link
                    to={`/profile/${currentUser._id}`}
                    className="block px-4 py-2 hover:bg-hover w-full text-left"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  
                  {isMobile && (
                    <>
                      <Link
                        to="/"
                        className="block px-4 py-2 hover:bg-hover w-full text-left"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Home
                      </Link>
                      <Link
                        to="/bookmarks"
                        className="block px-4 py-2 hover:bg-hover w-full text-left"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Bookmarks
                      </Link>
                      <Link
                        to="/notifications"
                        className="block px-4 py-2 hover:bg-hover w-full text-left"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Notifications
                        {unreadCount > 0 && (
                          <span className="ml-2 bg-primary text-white text-xs rounded-full px-2 py-1">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        to="/editor"
                        className="block px-4 py-2 hover:bg-hover w-full text-left"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Write
                      </Link>
                    </>
                  )}
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block px-4 py-2 hover:bg-hover w-full text-left"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="hover:text-muted">
                Login
              </Link>
              <Link to="/register" className="btn hidden sm:block">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
