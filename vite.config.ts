import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import envCompatible from 'vite-plugin-env-compatible';

// https://vitejs.dev/config/
export default defineConfig({
  envPrefix: 'REACT_APP_',
  plugins: [react(), envCompatible()],
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
      constants: 'constants-browserify',
      http: 'stream-http',
      https: 'https-browserify',
      os: 'os-browserify/browser',
      stream: 'stream-browserify',
      timers: 'timers-browserify',
      url: 'url'
    }
  },
  define: {
    child_process: false,
    fs: false
  }
});
