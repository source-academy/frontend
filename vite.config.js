import path from 'path';

import { defineConfig, loadEnv } from 'vite';

import react from '@vitejs/plugin-react';
import tsPath from 'vite-tsconfig-paths';
import wasm from 'vite-plugin-wasm';

export default ({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  return defineConfig({
    define: {
      global: {},
      'process.env': env
    },
    resolve: {
      alias: {
        src: path.resolve(__dirname, './src'),
        'node-fetch': 'isomorphic-fetch'
      }
    },
    plugins: [react(), tsPath(), wasm()],
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis'
        }
      }
    },
    build: {
      target: 'ESNext'
    }
  });
};
