import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    css: true,
    
    // Enhanced reporting configuration
    reporters: [
      'default', 
      'html',
      'json',
    ],
    outputFile: {
      html: './test-reports/vitest-report.html',
      json: './test-reports/vitest-report.json',
    },
    
    // Enhanced coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './test-reports/coverage',
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
        '**/*.d.ts',
        '**/__tests__/**',
        '**/mocks/**',
      ],
    },
    
    // UI configuration
    ui: true,
    
    // Verbose output for better test details
    logHeapUsage: true,
    watch: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
