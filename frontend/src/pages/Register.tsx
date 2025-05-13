import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import { getToast } from '../hooks/use-toast';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name || !email || !username || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      await register(email, password, name, username);
      
      // Show success toast
      try {
        const toast = getToast();
        toast.showToast('Account created successfully!', 'success');
      } catch (error) {
        // Toast provider not initialized, ignore
      }
      
      // Redirect to home page
      navigate('/');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Log more detailed error information
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        
        // Set a more specific error message if available
        if (error.response.data && error.response.data.message) {
          setError(error.response.data.message);
        } else {
          setError(`Registration failed with status ${error.response.status}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
        setError('No response received from server. Please try again later.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        setError(error.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted mt-2">Join Mercury and start sharing your thoughts</p>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-500 text-red-800 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {/* Registration form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Full name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-outline rounded-md focus:outline-none focus:ring-1 focus:ring-fg"
              placeholder="John Doe"
              disabled={loading}
              required
            />
          </div>
          
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
          
          {/* Username field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-outline rounded-md focus:outline-none focus:ring-1 focus:ring-fg"
              placeholder="johndoe"
              disabled={loading}
              required
            />
          </div>
          
          {/* Password field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
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
            <p className="text-xs text-muted mt-1">
              Must be at least 6 characters
            </p>
          </div>
          
          {/* Confirm password field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        
        
        {/* Login link */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-fg hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
