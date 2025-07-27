/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [
      './src/setupTests.ts',
      './src/i18n/i18n.ts'
    ]
  },
  resolve: {
    alias: {
      // File mocks
      '\\.(jpg|jpeg)$': new URL('./src/fileMock.ts', import.meta.url).pathname,
      '\\.svg$': 'identity-obj-proxy',
      '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
      // Module path fixes
      'unist-util-visit-parents/do-not-use-color': 
        new URL('./node_modules/unist-util-visit-parents/lib', import.meta.url).pathname,
      'vfile/do-not-use-conditional-minpath': 
        new URL('./node_modules/vfile/lib', import.meta.url).pathname,
      'vfile/do-not-use-conditional-minproc': 
        new URL('./node_modules/vfile/lib', import.meta.url).pathname,
      'vfile/do-not-use-conditional-minurl': 
        new URL('./node_modules/vfile/lib', import.meta.url).pathname
    }
  }
});