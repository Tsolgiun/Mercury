import { vi } from 'vitest';

// Firebase Auth mock
const authMock = {
  currentUser: null,
  onAuthStateChanged: vi.fn((callback) => {
    callback(null);
    return vi.fn(); // Unsubscribe function
  }),
  signInWithEmailAndPassword: vi.fn(() => Promise.resolve({
    user: {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
    },
  })),
  createUserWithEmailAndPassword: vi.fn(() => Promise.resolve({
    user: {
      uid: 'new-test-uid',
      email: 'newtest@example.com',
      displayName: null,
    },
  })),
  signOut: vi.fn(() => Promise.resolve()),
  updateProfile: vi.fn(() => Promise.resolve()),
};

// Firebase Firestore mock
const firestoreMock = {
  collection: vi.fn(() => ({
    doc: vi.fn(() => ({
      get: vi.fn(() => Promise.resolve({
        exists: true,
        data: () => ({
          id: 'test-id',
          name: 'Test Document',
        }),
      })),
      set: vi.fn(() => Promise.resolve()),
      update: vi.fn(() => Promise.resolve()),
      delete: vi.fn(() => Promise.resolve()),
    })),
    add: vi.fn(() => Promise.resolve({ id: 'new-doc-id' })),
    where: vi.fn(() => ({
      get: vi.fn(() => Promise.resolve({
        empty: false,
        docs: [
          {
            id: 'test-doc-id',
            data: () => ({ id: 'test-doc-id', title: 'Test Document' }),
          },
        ],
      })),
    })),
  })),
};

// Firebase Storage mock
const storageMock = {
  ref: vi.fn(() => ({
    child: vi.fn(() => ({
      put: vi.fn(() => ({
        on: vi.fn((event, progressCallback, errorCallback, completeCallback) => {
          // Simulate successful upload
          completeCallback({
            ref: {
              getDownloadURL: vi.fn(() => Promise.resolve('https://example.com/image.jpg')),
            },
          });
        }),
      })),
      getDownloadURL: vi.fn(() => Promise.resolve('https://example.com/image.jpg')),
    })),
  })),
};

// Main Firebase mock
export const mockFirebase = {
  auth: vi.fn(() => authMock),
  firestore: vi.fn(() => firestoreMock),
  storage: vi.fn(() => storageMock),
};
