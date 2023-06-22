import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import eslint from 'vite-plugin-eslint';
import wasm from 'vite-plugin-wasm';

const envPrefix = 'REACT_APP_';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // const env = { ...process.env, ...loadEnv(mode, process.cwd(), envPrefix) };
  const env = loadEnv(mode, process.cwd(), envPrefix);
  return {
    envPrefix: envPrefix,
    plugins: [react(), wasm(), eslint()],
    resolve: {
      alias: {
        src: path.resolve(__dirname, './src'),
        constants: 'constants-browserify',
        http: 'stream-http',
        https: 'https-browserify',
        os: 'os-browserify/browser',
        stream: 'stream-browserify',
        timers: 'timers-browserify',
        url: 'url',
        'xmlhttprequest-ts': './node_modules/xmlhttprequest-ts/bundles/xmlhttprequest-ts.umd.js'
      }
    },
    define: {
      'process.env': env
    },
    optimizeDeps: {
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: 'globalThis'
        },
        plugins: [
          NodeGlobalsPolyfillPlugin({
            buffer: true,
            process: false
          })
        ]
      }
    },
    test: {
      globals: true
    },
    server: {
      port: 8000
    },
    build: {
      target: 'esnext',
      outDir: 'build'
    }
  };
});
