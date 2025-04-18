import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/unit/setup.ts'],
    globals: true,
    alias: {
      '@': resolve(__dirname, './src'),
    },
    include: ['tests/unit/**/*.test.{ts,tsx}'], // modified to include TSX files
    exclude: ['node_modules', '**/tests/e2e/**']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
