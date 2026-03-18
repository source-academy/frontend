import path from 'node:path';

import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    coverage: {
      reporter: ['text', 'html', 'lcov']
    }
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, 'src'),
      // File mocks for static assets
      '\\.(jpg|jpeg|png|gif)$': './src/fileMock.ts',
      '\\.svg$': 'identity-obj-proxy',
      '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
      // Module path fixes from original Jest config
      'unist-util-visit-parents/do-not-use-color': './node_modules/unist-util-visit-parents/lib',
      'vfile/do-not-use-conditional-minpath': './node_modules/vfile/lib',
      'vfile/do-not-use-conditional-minproc': './node_modules/vfile/lib',
      'vfile/do-not-use-conditional-minurl': './node_modules/vfile/lib'
    }
  }
});
