import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  // Create a process.env object with VITE_ variables
  const processEnvValues = {};
  for (const key in env) {
    if (key.startsWith('VITE_')) {
      processEnvValues[key.replace('VITE_', '')] = JSON.stringify(env[key]);
    }
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      open: true,
    },
    build: {
      outDir: 'build',
      sourcemap: true,
    },
    // Handle environment variables
    define: {
      // Make process.env available for compatibility with CRA code
      'process.env': processEnvValues,
    },
  };
});
