import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the current device is mobile
 * @param breakpoint - The breakpoint width in pixels (default: 640)
 * @returns boolean indicating if the device is mobile
 */
export function useMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is defined (to avoid SSR issues)
    if (typeof window === 'undefined') return;

    // Initial check
    setIsMobile(window.innerWidth < breakpoint);

    // Handler for window resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]);

  return isMobile;
}
