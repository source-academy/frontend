import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from 'vite-tsconfig-paths';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills'
import wasm from "vite-plugin-wasm";

export default defineConfig({
  resolve: {
    alias: [
      // Fix SCSS modules
      { find: /^~(.*)$/, replacement: '$1' },

      // Use umd bundle for xmlhttprequest-ts dependency
      {
        find: 'xmlhttprequest-ts',
        replacement: './node_modules/xmlhttprequest-ts/bundles/xmlhttprequest-ts.umd.js'
      },

    ]
  },
  plugins: [react(), viteTsconfigPaths(), wasm()],
  optimizeDeps: {
    
    esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
            global: 'globalThis',
        },
        // Enable esbuild polyfill plugins
        plugins: [
          NodeModulesPolyfillPlugin(),
          NodeGlobalsPolyfillPlugin({
              process: true,
              buffer: true,
          }),
      ]
    },
  },
  build: {
    target: 'ESNext',
    rollupOptions: {
        plugins: [
            // Enable rollup polyfills plugin
            // used during production bundling
            rollupNodePolyFill({
              fs: true,
            }),
        ]
    }
}
})