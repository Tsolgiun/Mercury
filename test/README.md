# Mercury Project Testing Strategy

This document outlines the testing strategy implemented for the Mercury project, which can be included in your thesis. The testing approach covers both backend (Node.js/Express) and frontend (React) components of the application.

## Testing Architecture

The project implements a comprehensive testing strategy with:

1. **Unit Tests** - Testing individual components in isolation
2. **Integration Tests** - Testing interactions between components
3. **API Tests** - Testing REST API endpoints
4. **Component Tests** - Testing React components

## Backend Testing

### Testing Stack
- **Jest** - Test runner and assertion library
- **Supertest** - HTTP assertions for API testing
- **MongoDB Memory Server** - In-memory MongoDB for isolated testing

### Test Structure
The backend tests are organized in the `__tests__` directory, mirroring the structure of the `src` directory:

```
__tests__/
├── setup.ts                # Global test setup (DB connections, etc.)
├── models/                 # Unit tests for MongoDB models
│   ├── userModel.test.ts
│   ├── postModel.test.ts
│   └── ...
├── controllers/            # Tests for API controllers
│   ├── authController.test.ts
│   └── ...
└── utils/                  # Tests for utility functions
```

### Running Backend Tests
```bash
# Run tests in watch mode
npm test

# Run tests for CI
npm run test:ci
```

### Testing Approach

#### Model Tests
- Validate schema definitions
- Test document creation and validation
- Verify required fields, defaults, and constraints
- Test custom methods and virtual properties

#### Controller Tests
- Test API endpoints with Supertest
- Verify correct responses for valid inputs
- Test error handling for edge cases
- Simulate authentication and authorization

## Frontend Testing

### Testing Stack
- **Vitest** - Test runner compatible with Vite
- **React Testing Library** - Component testing utilities
- **JSDOM** - Browser environment simulation
- **@vitest/ui** - Visual interface for test results

### Test Structure
The frontend tests are organized in the `src/__tests__` directory:

```
src/__tests__/
├── setup.ts                # Global test setup
├── mocks/                  # Mock implementations
│   └── firebase-mock.ts
├── components/             # Component tests
│   ├── RichTextEditor.test.tsx
│   └── ...
├── context/                # Context API tests
│   ├── AuthContext.test.tsx
│   └── ...
└── hooks/                  # Custom hook tests
```

### Running Frontend Tests
```bash
# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### Testing Approach

#### Component Tests
- Render components in isolation
- Test component interactions (clicks, inputs)
- Verify component rendering based on props
- Test component state changes

#### Context Tests
- Test context providers and consumers
- Verify context state management
- Test custom hooks that use context

#### Mock Implementation
- Firebase services are mocked for testing
- API calls are intercepted and mocked responses provided

## Test Coverage Goals

The testing strategy aims to achieve:

- **Backend**: 80%+ coverage for models, controllers and utilities
- **Frontend**: 70%+ coverage for components, contexts and hooks

## Best Practices Implemented

1. **Isolation** - Tests are isolated with mocks and in-memory databases
2. **Speed** - Fast execution through efficient mocking strategies
3. **Maintainability** - Clear test organization mirroring project structure
4. **Reliability** - Avoiding flaky tests with proper setup/teardown

## Continuous Integration

Tests are configured to run in CI environments with:

```bash
# Backend CI tests
npm run test:ci

# Frontend CI tests
npm run test:ci
```

This testing framework provides a solid foundation for verifying application functionality, ensuring code quality, and facilitating safe refactoring and feature additions.
