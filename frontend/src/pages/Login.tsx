import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import { getToast } from '../hooks/use-toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      await login(email, password);
      
      // Show success toast
      try {
        const toast = getToast();
        toast.showToast('Successfully logged in!', 'success');
      } catch (error) {
        // Toast provider not initialized, ignore
      }
      
      // Add a small delay to ensure auth state is updated before redirecting
      setTimeout(() => {
        // Redirect to home page
        navigate('/');
      }, 500);
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted mt-2">Sign in to your Mercury account</p>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-500 text-red-800 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-outline rounded-md focus:outline-none focus:ring-1 focus:ring-fg"
              placeholder="you@example.com"
              disabled={loading}
              required
            />
          </div>
          
          {/* Password field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <Link to="/forgot-password" className="text-sm text-muted hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-outline rounded-md focus:outline-none focus:ring-1 focus:ring-fg"
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>
          
          {/* Submit button */}
          <button
            type="submit"
            className="w-full btn bg-fg text-bg hover:bg-fg/90"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        
        {/* Register link */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted">
            Don't have an account?{' '}
            <Link to="/register" className="text-fg hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
