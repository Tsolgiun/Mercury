import React, { useState, useEffect } from 'react';

// Simple toast notification system

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastManager {
  showToast: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void;
  hideToast: (id: string) => void;
  dismissToast: (id: string) => void; // Alias for hideToast for compatibility
  clearToasts: () => void;
}

// Singleton toast manager
let toastManager: ToastManager | null = null;

// Event listeners
const listeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

// Create a unique ID for each toast
const createId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Create the toast manager if it doesn't exist
const createToastManager = (): ToastManager => {
  if (toastManager) return toastManager;

  toastManager = {
    showToast: (message: string, type: 'success' | 'error' | 'info' = 'info', duration = 5000) => {
      const id = createId();
      const newToast: Toast = { id, message, type, duration };
      
      toasts = [...toasts, newToast];
      notifyListeners();
      
      // Auto-hide toast after duration
      if (duration > 0) {
        setTimeout(() => {
          toastManager?.hideToast(id);
        }, duration);
      }
    },
    
    hideToast: (id: string) => {
      toasts = toasts.filter(toast => toast.id !== id);
      notifyListeners();
    },
    
    // Alias for hideToast for compatibility
    dismissToast: (id: string) => {
      toastManager?.hideToast(id);
    },
    
    clearToasts: () => {
      toasts = [];
      notifyListeners();
    }
  };
  
  return toastManager;
};

// Notify all listeners of toast changes
const notifyListeners = () => {
  listeners.forEach(listener => listener([...toasts]));
};

/**
 * Hook to subscribe to toast notifications
 * @returns Toast state and methods
 */
export const useToast = () => {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>(toasts);
  
  useEffect(() => {
    const handleToastsChange = (updatedToasts: Toast[]) => {
      setCurrentToasts(updatedToasts);
    };
    
    listeners.push(handleToastsChange);
    
    return () => {
      const index = listeners.indexOf(handleToastsChange);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);
  
  return {
    toasts: currentToasts,
    ...createToastManager()
  };
};

/**
 * Get the toast manager without React hooks
 * Useful for non-component contexts
 * @returns Toast manager
 */
export const getToast = (): ToastManager => {
  return toastManager || createToastManager();
};

/**
 * Initialize the toast system
 * Call this once at app startup
 */
export const initializeToast = (): void => {
  createToastManager();
};

export default useToast;
