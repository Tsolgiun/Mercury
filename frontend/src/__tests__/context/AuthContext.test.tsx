import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, User, AuthContext } from '../../context/AuthContext';
import authApi from '../../api/authApi';
import * as apiModule from '../../lib/api';
import * as sessionPersistence from '../../lib/sessionPersistence';

// Mock API modules
vi.mock('../../api/authApi', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
  }
}));

vi.mock('../../lib/api', () => ({
  setTokens: vi.fn(),
  clearTokens: vi.fn(),
  getAccessToken: vi.fn(() => 'mock-access-token'),
  getRefreshToken: vi.fn(() => 'mock-refresh-token'),
  refreshAccessToken: vi.fn(),
  default: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() }
    }
  }
}));

vi.mock('../../lib/sessionPersistence', () => ({
  initSessionPersistence: vi.fn(),
  performProactiveRefresh: vi.fn(),
  recordTokenRefresh: vi.fn(),
  setAuthCheckStatus: vi.fn(),
}));

// Test component to access auth context
const TestComponent = () => {
  const Auth = React.useContext(AuthContext);
  
  if (!Auth) {
    return <div>No Auth Context</div>;
  }
  
  return (
    <div>
      <div data-testid="user-info">
        {Auth.currentUser ? Auth.currentUser.name : 'No user'}
      </div>
      <button 
        data-testid="login-button" 
        onClick={async () => {
          try {
            await Auth.login('test@example.com', 'password123');
          } catch (error) {
            console.error('Login failed', error);
          }
        }}
      >
        Login
      </button>
      <button 
        data-testid="register-button" 
        onClick={async () => {
          try {
            await Auth.register('new@example.com', 'password123', 'New User', 'newuser');
          } catch (error) {
            console.error('Registration failed', error);
          }
        }}
      >
        Register
      </button>
      <button 
        data-testid="logout-button" 
        onClick={async () => {
          try {
            await Auth.logout();
          } catch (error) {
            console.error('Logout failed', error);
          }
        }}
      >
        Logout
      </button>
      <div data-testid="loading-state">
        {Auth.userLoading ? 'Loading' : 'Not Loading'}
      </div>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('should provide initial loading state', async () => {
    // API call to get the user profile is pending
    vi.spyOn(apiModule.default, 'get').mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({data: null}), 100))
    );
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Should initially be in loading state
    expect(screen.getByTestId('loading-state').textContent).toBe('Loading');
    
    // After API resolves, loading should be false
    await waitFor(() => {
      expect(screen.getByTestId('loading-state').textContent).toBe('Not Loading');
    });
  });
  it('should log in a user', async () => {
    const mockUser = { 
      _id: '123', 
      email: 'test@example.com', 
      name: 'Test User',
      username: 'testuser' 
    };
    
    // Setup mock before rendering
    (authApi.login as ReturnType<typeof vi.fn>).mockImplementation(async () => {
      const result = {
        user: mockUser,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        success: true
      };
      
      // Manually call setTokens to ensure it's called during the test
      apiModule.setTokens('access-token', 'refresh-token');
      
      return result;
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Click login button
    const loginButton = screen.getByTestId('login-button');
    await userEvent.click(loginButton);
    
    // Should call login API
    expect(authApi.login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
    
    // User info should be updated
    await waitFor(() => {
      expect(screen.getByTestId('user-info').textContent).toBe('Test User');
    });
  });
  it('should register a new user', async () => {
    const mockUser = { 
      _id: '456', 
      email: 'new@example.com', 
      name: 'New User',
      username: 'newuser' 
    };
    
    // Setup mock before rendering
    (authApi.register as ReturnType<typeof vi.fn>).mockImplementation(async () => {
      const result = {
        user: mockUser,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        success: true
      };
      
      // Manually call setTokens to ensure it's called during the test
      apiModule.setTokens('access-token', 'refresh-token');
      
      return result;
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    const registerButton = screen.getByTestId('register-button');
    // Click register button
    await userEvent.click(registerButton);
    
    // Should call register API
    expect(authApi.register).toHaveBeenCalledWith({
      email: 'new@example.com', 
      password: 'password123', 
      name: 'New User', 
      username: 'newuser'
    });
    
    // User info should be updated
    await waitFor(() => {
      expect(screen.getByTestId('user-info').textContent).toBe('New User');
    });
  });  it('should logout a user', async () => {
    const mockUser = { 
      _id: '123', 
      email: 'test@example.com', 
      name: 'Test User',
      username: 'testuser' 
    };
    
    // First, make sure the default API methods are properly mocked
    (apiModule.getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue('mocked-token');
    (apiModule.getRefreshToken as ReturnType<typeof vi.fn>).mockReturnValue('mocked-refresh-token');
    
    // Setup initial logged in state by mocking API response
    vi.spyOn(apiModule.default, 'get').mockResolvedValue({data: mockUser});
    
    // Render with mock provider
    const { rerender } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for user to be loaded and rendered
    await waitFor(() => {
      const userInfo = screen.getByTestId('user-info');
      expect(userInfo.textContent).toBe('Test User');
    });
    
    // Mock logout behavior
    (authApi.logout as ReturnType<typeof vi.fn>).mockImplementation(() => {
      // Call clearTokens directly to ensure it happens during test execution
      apiModule.clearTokens();
      return Promise.resolve();
    });
    
    const logoutButton = screen.getByTestId('logout-button');
    
    // Click logout button
    await userEvent.click(logoutButton);
    
    // Should call logout API
    expect(authApi.logout).toHaveBeenCalled();
    
    // Re-render to ensure updates
    rerender(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // User info should show "No user" after logout
    await waitFor(() => {
      expect(screen.getByTestId('user-info').textContent).toBe('No user');
    }, { timeout: 2000 });
  });
});
