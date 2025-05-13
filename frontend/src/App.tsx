import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './context/AuthContext';
import { PostProvider } from './context/PostContext';
import { SocialProvider } from './context/SocialContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Post from './pages/Post';
import Profile from './pages/Profile';
import Editor from './pages/Editor';
import Bookmarks from './pages/Bookmarks';
import NotFound from './pages/not-found';

// Components
import { useAuth } from './hooks/use-auth';
import { useToast, initializeToast } from './hooks/use-toast';
import Navbar from './components/layout/Navbar';
import ToastContainer from './components/ui/toast';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userLoading } = useAuth();

  if (userLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// Toast provider component
const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toast = useToast();
  
  // Initialize global toast instance
  React.useEffect(() => {
    initializeToast();
  }, []);
  
  return (
    <>
      {children}
      <ToastContainer toasts={toast.toasts} dismissToast={toast.dismissToast} />
    </>
  );
};

// Main App component
const AppContent: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <main className="pt-16 min-h-screen bg-bg">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/post/:id" element={<Post />} />
          <Route path="/profile/:uid" element={<Profile />} />
          <Route 
            path="/editor" 
            element={
              <ProtectedRoute>
                <Editor />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/editor/:id" 
            element={
              <ProtectedRoute>
                <Editor />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/bookmarks" 
            element={
              <ProtectedRoute>
                <Bookmarks />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </Router>
  );
};

// App with providers
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PostProvider>
          <SocialProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </SocialProvider>
        </PostProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
