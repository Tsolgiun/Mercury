import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { mockFirebase } from './mocks/firebase-mock';

// Mock Firebase
vi.mock('../lib/firebase', () => mockFirebase);

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Clean up after each test
afterEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
});
