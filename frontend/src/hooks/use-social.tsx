import { useSocialContext } from '../context/SocialContext';

/**
 * Custom hook for social operations
 * This is a wrapper around the useSocialContext hook from SocialContext
 * to make it easier to import and use throughout the application
 */
export function useSocial() {
  return useSocialContext();
}
