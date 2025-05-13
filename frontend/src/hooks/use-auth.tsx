import { useAuth as useAuthContext } from '../context/AuthContext';

/**
 * Custom hook for authentication
 * This is a wrapper around the useAuth hook from AuthContext
 * to make it easier to import and use throughout the application
 */
export function useAuth() {
  return useAuthContext();
}
