import fs from 'node:fs';
import path from 'node:path';

import { InjectManifest } from '@aaroon/workbox-rspack-plugin';
import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginEslint } from '@rsbuild/plugin-eslint';
import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss';

const { publicVars, rawPublicVars } = loadEnv({ prefixes: ['REACT_APP_'] });

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginSvgr({ mixedImport: true }),
    pluginNodePolyfill(),
    pluginSass(),
    pluginTailwindcss(),
    pluginEslint({
      enable: process.env.NODE_ENV === 'development',
      eslintPluginOptions: {
        cwd: __dirname,
        configType: 'flat',
      },
    }),
  ],
  server: {
    port: 8000,
  },
  dev: {
    setupMiddlewares: [
      middlewares => {
        // The dev server's SPA fallback serves index.html (HTTP 200) for ANY unmatched path,
        // including missing static assets. That silently turns a wrong/stale evaluator or plugin
        // URL into HTML, which the Conductor then loads as a Worker script — it fails to parse
        // (`Unexpected token '<'`) and the run hangs with no clear error. For these locally-served
        // bundle directories, return a real 404 when the file is absent so the failure is loud and
        // the Conductor surfaces a proper "cannot load evaluator" error instead of hanging.
        const PUBLIC_DIR = path.join(__dirname, 'public');
        // Only guard requests for actual files (with an extension) under these locally-served
        // bundle directories, so extensionless client-side routes still fall through to the SPA.
        const GUARDED = /^\/(evaluators|plugins|languages)\/.+\.[^/]+$/;
        middlewares.unshift((req, res, next) => {
          const pathname = decodeURIComponent((req.url ?? '').split('?')[0]);
          if (GUARDED.test(pathname)) {
            const filePath = path.join(PUBLIC_DIR, pathname);
            // Guard against path traversal, then 404 if the asset does not exist on disk.
            if (!filePath.startsWith(PUBLIC_DIR) || !fs.existsSync(filePath)) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'text/plain; charset=utf-8');
              res.end(`Not found: ${pathname}`);
              return;
            }
          }
          next();
        });
      },
    ],
  },
  tools: {
    // TODO: See if still needed
    rspack: config => {
      // // avoid the entire process.env being inserted into the service worker
      // // if SW_EXCLUDE_REGEXES is unset
      // const definePlugin = config.plugins?.find(
      //   plugin => plugin.constructor.name === 'DefinePlugin'
      // );
      // const inlineProcessEnv = definePlugin.definitions['process.env'];
      // if (!inlineProcessEnv.REACT_APP_SW_EXCLUDE_REGEXES) {
      //   inlineProcessEnv.REACT_APP_SW_EXCLUDE_REGEXES = undefined;
      // }

      // // add rules to pack WASM (for Sourceror)
      // const wasmExtensionRegExp = /\.wasm$/;
      // config.resolve.extensions.push('.wasm');
      // config.module.rules.forEach(rule => {
      //   (rule.oneOf || []).forEach(oneOf => {
      //     if (oneOf.type === 'asset/resource') {
      //       oneOf.exclude.push(wasmExtensionRegExp);
      //     }
      //   });
      // });
      // // See https://webpack.js.org/configuration/experiments/#experiments.
      // config.experiments = {
      //   syncWebAssembly: true
      // };
      // config.output.webassemblyModuleFilename = 'static/[hash].module.wasm';

      config.ignoreWarnings = [
        (warning: any) => {
          // Ignore the warnings that occur because js-slang uses dynamic imports
          // to load Source modules
          const moduleName = warning.moduleDescriptor?.name;
          if (!moduleName) return false;

          if (!/js-slang\/dist\/modules\/loader\/loaders.js/.test(moduleName)) return false;
          return /Critical dependency: the request of a dependency is an expression/.test(
            warning.message,
          );
        },
      ];

      config.plugins = [
        ...config.plugins,
        new InjectManifest({
          swSrc: './src/service-worker.ts',
          swDest: 'service-worker.js',
          maximumFileSizeToCacheInBytes: 30 * 1024 * 1024,
        }),
      ];

      // Workaround to suppress warnings caused by ts-morph in js-slang
      if (config.module) {
        config.module.noParse = /node_modules\/@ts-morph\/common\/dist\/typescript\.js$/;
      }

      return config;
    },
  },
  source: {
    define: {
      ...publicVars,
      'process.env': JSON.stringify(rawPublicVars),
    },
  },
  html: {
    template: './public/index.html',
    favicon: './public/icons/favicon.ico',
  },
  output: {
    distPath: {
      root: './build',
    },
    sourceMap: true,
  },
});
