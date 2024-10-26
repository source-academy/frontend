import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import inject from '@rollup/plugin-inject';
import react from '@vitejs/plugin-react';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import * as sass from 'sass';
import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';
import wasm from 'vite-plugin-wasm';
import tsconfigPaths from 'vite-tsconfig-paths';

const ignoreSvgIcon = () => new sass.SassString('');

const envPrefix = 'REACT_APP_';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Compatibility with Create React App environment variables
  const env = loadEnv(mode, process.cwd(), envPrefix);
  return {
    envPrefix,
    // https://cathalmacdonnacha.com/migrating-from-create-react-app-cra-to-vite
    plugins: [react(), tsconfigPaths(), svgr({ include: '**/*.svg?react' }), wasm()],
    resolve: {
      alias: {
        fs: 'browserfs',
        path: 'path-browserify',
        src: '/src'
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
        plugins: [NodeGlobalsPolyfillPlugin({ buffer: true, process: false })]
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          functions: {
            // FIXME: Support Blueprint's custom function
            // https://github.com/palantir/blueprint/issues/5334
            // https://github.com/palantir/blueprint/issues/6051
            'svg-icon($path, $selectors: null)': ignoreSvgIcon
          }
        }
      }
    },
    server: {
      // TODO: Change to 8000 after CRA migration is complete
      port: 8000
    },
    build: {
      target: 'esnext',
      rollupOptions: {
        // https://github.com/vitejs/vite/discussions/6180#discussioncomment-7254293
        plugins: [inject({ Buffer: ['buffer/', 'Buffer'] }), nodePolyfills()] as any
      }
    }
  };
});
