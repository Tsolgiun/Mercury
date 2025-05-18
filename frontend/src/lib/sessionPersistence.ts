import { getAccessToken, getRefreshToken, refreshAccessToken, setTokens } from './api';

// Session storage key for last token refresh time
const LAST_REFRESH_KEY = 'last_token_refresh';
// Session storage key for auth check status
const AUTH_CHECK_STATUS_KEY = 'auth_check_status';

/**
 * Record the time of the last token refresh
 */
export const recordTokenRefresh = (): void => {
  try {
    sessionStorage.setItem(LAST_REFRESH_KEY, Date.now().toString());
  } catch (error) {
    console.error('Failed to record token refresh time:', error);
  }
};

/**
 * Get the time of the last token refresh
 * @returns Timestamp of last refresh or null if not available
 */
export const getLastRefreshTime = (): number | null => {
  try {
    const timestamp = sessionStorage.getItem(LAST_REFRESH_KEY);
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch (error) {
    console.error('Failed to get last refresh time:', error);
    return null;
  }
};

/**
 * Check if a token refresh is needed based on time since last refresh
 * @param refreshIntervalMs - Refresh interval in milliseconds (default: 55 minutes)
 * @returns Boolean indicating if refresh is needed
 */
export const isRefreshNeeded = (refreshIntervalMs = 55 * 60 * 1000): boolean => {
  const lastRefresh = getLastRefreshTime();
  
  // If no last refresh time, refresh is needed
  if (!lastRefresh) {
    return true;
  }
  
  const now = Date.now();
  const timeSinceLastRefresh = now - lastRefresh;
  
  // Refresh if more than the interval has passed
  return timeSinceLastRefresh > refreshIntervalMs;
};

/**
 * Set the auth check status
 * @param status - Status to set
 */
export const setAuthCheckStatus = (status: 'pending' | 'success' | 'failed'): void => {
  try {
    sessionStorage.setItem(AUTH_CHECK_STATUS_KEY, status);
  } catch (error) {
    console.error('Failed to set auth check status:', error);
  }
};

/**
 * Get the current auth check status
 * @returns Current auth check status
 */
export const getAuthCheckStatus = (): string | null => {
  try {
    return sessionStorage.getItem(AUTH_CHECK_STATUS_KEY);
  } catch (error) {
    console.error('Failed to get auth check status:', error);
    return null;
  }
};

/**
 * Perform a proactive token refresh if needed
 * @returns Promise resolving to a boolean indicating if refresh was performed
 */
export const performProactiveRefresh = async (): Promise<boolean> => {
  // Check if we have tokens
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    console.log('No refresh token available for proactive refresh');
    return false;
  }
  
  // If we have an access token and refresh is not needed, skip refresh
  if (accessToken && !isRefreshNeeded()) {
    console.log('Proactive refresh not needed');
    return false;
  }
  
  try {
    console.log('Performing proactive token refresh');
    const tokens = await refreshAccessToken();
    
    // Record the refresh time
    recordTokenRefresh();
    
    console.log('Proactive token refresh successful');
    return true;
  } catch (error) {
    console.error('Proactive token refresh failed:', error);
    
    // Only return false, don't clear tokens here
    // Let the regular auth flow handle token clearing if needed
    return false;
  }
};

/**
 * Initialize session persistence
 * This should be called when the app starts
 */
export const initSessionPersistence = (): void => {
  // Clear any existing auth check status
  setAuthCheckStatus('pending');
  
  // Set up periodic token refresh
  const REFRESH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
  
  // Perform initial check
  performProactiveRefresh().then(refreshed => {
    if (refreshed) {
      console.log('Initial token refresh performed');
    }
  });
  
  // Set up interval for periodic checks
  setInterval(() => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    
    // Only attempt refresh if we have a refresh token
    if (refreshToken) {
      performProactiveRefresh().then(refreshed => {
        if (refreshed) {
          console.log('Periodic token refresh performed');
        }
      });
    }
  }, REFRESH_CHECK_INTERVAL);
  
  // Also refresh token on visibility change (when user returns to the tab)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const refreshToken = getRefreshToken();
      
      if (refreshToken) {
        console.log('Page became visible, checking if token refresh is needed');
        performProactiveRefresh();
      }
    }
  });
};
