import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';
import { pluginSvgr } from '@rsbuild/plugin-svgr';

const { publicVars } = loadEnv({ prefixes: ['REACT_APP_'] });

export default defineConfig({
  plugins: [pluginReact(), pluginSvgr({ mixedImport: true }), pluginNodePolyfill(), pluginSass()],
  server: {
    port: 8000
  },
  source: {
    define: publicVars
  },
  html: {
    template: './public/index.html',
    favicon: './public/icons/favicon.ico'
  },
  output: {
    distPath: {
      root: './build'
    }
  }
});
