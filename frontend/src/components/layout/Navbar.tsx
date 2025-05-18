import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth';
import { useMobile } from '../../hooks/use-mobile';
import { useNotifications } from '../../context/NotificationContext';
import SearchBar from '../search/SearchBar';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  // Check if the current path matches
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Navigation items with icons
  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      requiresAuth: false
    },
    {
      name: 'Bookmarks',
      path: '/bookmarks',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ),
      requiresAuth: true
    },
    {
      name: 'Write',
      path: '/editor',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      requiresAuth: true
    },
    {
      name: 'Notifications',
      path: '/notifications',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      requiresAuth: true,
      badge: unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount) : null
    }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`fixed ${isMobile ? 'hidden' : 'flex'} flex-col h-full w-16 bg-bg border-r border-outline z-20 left-0`}>
        {currentUser ? (
          <div className="flex flex-col items-center justify-between h-full py-6">
            {/* Top Section - Logo */}
            <div className="flex flex-col items-center">
              <Link to="/" className="mb-6 transition-transform duration-200 hover:scale-110">
                <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px' }}>
                    planet
                  </span>
                </div>
              </Link>

              {/* Search Icon */}
              <div className="mt-2">
                <button 
                  className="p-2 rounded-full hover:bg-hover transition-all duration-200 hover:shadow-md hover:scale-110"
                  onClick={() => navigate('/search')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Middle Section - Navigation Items */}
            <div className="flex flex-col items-center space-y-8">
              {navItems.map((item) => (
                (!item.requiresAuth || currentUser) && (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`p-2 rounded-full relative transition-all duration-200 hover:scale-110 hover:shadow-md ${
                      isActive(item.path) ? 'text-primary' : 'text-fg hover:text-primary'
                    }`}
                  >
                    {item.icon}
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              ))}
            </div>

            {/* Bottom Section - Profile */}
            <div className="flex flex-col items-center">
              <button
                onClick={toggleMenu}
                className={`p-1 rounded-full focus:outline-none transition-all duration-200 hover:scale-110 hover:shadow-md ${isMenuOpen ? 'ring-2 ring-primary' : ''}`}
              >
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-outline flex items-center justify-center text-muted">
                    {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </button>

              {/* Dropdown menu */}
              {isMenuOpen && (
                <div className="absolute left-full ml-2 bottom-0 w-48 bg-bg border border-outline rounded-md shadow-lg py-1 z-20">
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
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-6">
            <div className="flex flex-col items-center space-y-8">
              {/* Logo */}
              <Link to="/" className="transition-transform duration-200 hover:scale-110">
                <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '24px' }}>
                    planet
                  </span>
                </div>
              </Link>

              {/* Search Icon */}
              <button 
                className="p-2 rounded-full hover:bg-hover transition-all duration-200 hover:shadow-md hover:scale-110"
                onClick={() => navigate('/search')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Home */}
              <Link
                to="/"
                className={`p-2 rounded-full relative transition-all duration-200 hover:scale-110 hover:shadow-md ${
                  isActive('/') ? 'text-primary' : 'text-fg hover:text-primary'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Link>

              {/* Login */}
              <Link to="/login" className="p-2 rounded-full hover:bg-hover transition-all duration-200 hover:scale-110 hover:shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-bg border-t border-outline z-20 h-16">
          <div className="flex items-center justify-around h-full px-2">
            {/* Logo */}
            <Link to="/" className={`p-2 transition-transform duration-200 active:scale-90 ${isActive('/') ? 'text-primary' : 'text-fg'}`}>
              <div className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>
                  planet
                </span>
              </div>
            </Link>

            {/* Search */}
            <Link to="/search" className={`p-2 transition-transform duration-200 active:scale-90 ${isActive('/search') ? 'text-primary' : 'text-fg'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

            {/* Home */}
            <Link to="/" className={`p-2 transition-transform duration-200 active:scale-90 ${isActive('/') && !isActive('/search') ? 'text-primary' : 'text-fg'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Link>

            {currentUser && (
              <>
                {/* Write */}
                <Link to="/editor" className={`p-2 transition-transform duration-200 active:scale-90 ${isActive('/editor') ? 'text-primary' : 'text-fg'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Link>

                {/* Bookmarks */}
                <Link to="/bookmarks" className={`p-2 transition-transform duration-200 active:scale-90 ${isActive('/bookmarks') ? 'text-primary' : 'text-fg'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </Link>

                {/* Notifications */}
                <Link to="/notifications" className={`p-2 relative transition-transform duration-200 active:scale-90 ${isActive('/notifications') ? 'text-primary' : 'text-fg'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Profile */}
                <Link to={`/profile/${currentUser._id}`} className={`p-2 transition-transform duration-200 active:scale-90 ${isActive(`/profile/${currentUser._id}`) ? 'text-primary' : 'text-fg'}`}>
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name || 'User'}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-outline flex items-center justify-center text-muted">
                      {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </Link>
              </>
            )}

            {!currentUser && (
              <Link to="/login" className="p-2 text-fg transition-transform duration-200 active:scale-90">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}
          </div>
        </nav>
      )}
    </>
  );
};

export default Navbar;
