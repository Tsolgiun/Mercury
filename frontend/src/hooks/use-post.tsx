import { usePostContext } from '../context/PostContext';

/**
 * Custom hook for post operations
 * This is a wrapper around the usePostContext hook from PostContext
 * to make it easier to import and use throughout the application
 */
export function usePost() {
  return usePostContext();
}
