module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  testTimeout: 60000, // Increase timeout to 60 seconds
  maxWorkers: 1, // Run tests sequentially to avoid connection issues
    // Reporter configuration
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'Mercury Backend Test Report',
        outputPath: './test-reports/test-report.html',
        includeFailureMsg: true,
        includeSuiteFailure: true,
        includeConsoleLog: true,
        theme: 'darkTheme',
        styleOverridePath: './__tests__/reporters/custom-style.css',
        sort: 'status'
      }
    ],
    [
      'jest-junit',
      {
        outputDirectory: './test-reports',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true
      }
    ],
    ['<rootDir>/__tests__/reporters/customReporter.js', { showPassedTests: false }]
  ],
  
  // Verbose output for better test details
  verbose: true,
  
  // Display test result with colors
  colors: true,
  
  // Collect test coverage
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/scripts/**',
    '!src/index.ts'
  ],
  coverageDirectory: './test-reports/coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'html']
};
