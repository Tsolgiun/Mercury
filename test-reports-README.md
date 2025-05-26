# Mercury Test Reporting

This document explains how to use the enhanced test reporting features of the Mercury project.

## Backend Test Reports (Jest)

The backend uses Jest with enhanced reporting capabilities:

### Available Test Commands:

- `npm test` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:report` - Run tests and generate HTML report
- `npm run test:clear` - Clear Jest cache
- `npm run test:detailed` - Run tests with verbose output and detect open handles
- `npm run test:view` - Run tests and automatically open the HTML report
- `npm run test:summary` - Run tests with summary output

### Report Locations:

- HTML Report: `test-reports/test-report.html`
- JUnit XML: `test-reports/junit.xml`
- Coverage: `test-reports/coverage/`

## Frontend Test Reports (Vitest)

The frontend uses Vitest with enhanced reporting:

### Available Test Commands:

- `npm test` - Run tests in watch mode
- `npm run test:ui` - Open Vitest UI for interactive test running
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:html` - Generate HTML report
- `npm run test:clear` - Clear test mocks
- `npm run test:watch` - Watch mode with verbose output
- `npm run test:detailed` - Run tests with verbose output
- `npm run test:view` - Run tests and automatically open the HTML report
- `npm run test:summary` - Run tests with detailed summary

### Report Locations:

- HTML Report: `test-reports/vitest-report.html`
- JSON Report: `test-reports/vitest-report.json`
- Coverage: `test-reports/coverage/`

## Project-Wide Test Commands

For convenience, you can run tests for both backend and frontend from the root directory:

- `npm test` - Run both backend and frontend tests
- `npm run test:backend` - Run only backend tests
- `npm run test:frontend` - Run only frontend tests
- `npm run test:coverage` - Generate coverage for both
- `npm run test:all` - Run all tests sequentially
- `npm run test:view-backend` - Run backend tests and open the report
- `npm run test:view-frontend` - Run frontend tests and open the report
- `npm run test:view-all` - Run all tests and open all reports
- `npm run test:summary` - Show test summary for both backend and frontend

## Custom Test Report Features

### Backend HTML Reports

- Dark/Light mode support (follows system preference)
- Clear visual indicators for test status
- Expandable test details and error messages
- Syntax highlighting for code in error messages
- Sortable test results
- Mobile-friendly design

### Frontend Test UI

The Vitest UI provides:
- Interactive test running
- Real-time test results
- Filter and search capabilities
- Coverage visualization
- Test history view

## Continuous Integration

For CI environments, use:

```bash
npm run test:ci
```

This will run tests with JUnit XML output that can be consumed by most CI systems.
