import { InjectManifest } from '@aaroon/workbox-rspack-plugin';
import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginEslint } from '@rsbuild/plugin-eslint';
import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';
import { pluginSvgr } from '@rsbuild/plugin-svgr';

const { publicVars, rawPublicVars } = loadEnv({ prefixes: ['REACT_APP_'] });

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginSvgr({ mixedImport: true }),
    pluginNodePolyfill(),
    pluginSass(),
    pluginEslint({
      enable: process.env.NODE_ENV === 'development',
      eslintPluginOptions: {
        cwd: __dirname,
        configType: 'flat'
      }
    })
  ],
  server: {
    port: 8000
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

      // const injectManifestPlugin = config.plugins.find(
      //   plugin => plugin.constructor.name === 'InjectManifest'
      // );
      // if (injectManifestPlugin) {
      //   injectManifestPlugin.config.maximumFileSizeToCacheInBytes = 20 * 1024 * 1024;
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

      // // Polyfill Node.js core modules.
      // // An empty implementation (false) is provided when there is no browser equivalent.
      // config.resolve.fallback = {
      //   child_process: false,
      //   constants: require.resolve('constants-browserify'),
      //   fs: false,
      //   http: require.resolve('stream-http'),
      //   https: require.resolve('https-browserify'),
      //   os: require.resolve('os-browserify/browser'),
      //   'path/posix': require.resolve('path-browserify'),
      //   'process/browser': require.resolve('process/browser'),
      //   stream: require.resolve('stream-browserify'),
      //   timers: require.resolve('timers-browserify'),
      //   url: require.resolve('url/')
      // };

      // // workaround .mjs files by Acorn
      // config.module.rules.push({
      //   test: /\.mjs$/,
      //   include: /node_modules/,
      //   type: 'javascript/auto',
      //   resolve: {
      //     fullySpecified: false
      //   }
      // });

      config.ignoreWarnings = [
        (warning: any) => {
          // Ignore the warnings that occur because js-slang uses dynamic imports
          // to load Source modules
          const moduleName = warning.moduleDescriptor?.name;
          if (!moduleName) return false;

          if (!/js-slang\/dist\/modules\/loader\/loaders.js/.test(moduleName)) return false;
          return /Critical dependency: the request of a dependency is an expression/.test(
            warning.message
          );
        }

        // {
        //   // Ignore warnings for dependencies that do not ship with a source map.
        //   // This is because we cannot do anything about our dependencies.
        //   module: /node_modules/,
        //   message: /Failed to parse source map/
        // },
        // [
      ];

      // config.plugins = [
      //   ...config.plugins,
      //   // Make environment variables available in the browser by polyfilling the 'process' Node.js module.
      //   new webpack.ProvidePlugin({
      //     process: 'process/browser'
      //   }),
      //   // Make the 'buffer' Node.js module available in the browser.
      //   new webpack.ProvidePlugin({
      //     Buffer: ['buffer', 'Buffer']
      //   })
      // ];

      config.plugins = [
        ...config.plugins,
        new InjectManifest({
          swSrc: './src/service-worker.ts',
          swDest: 'service-worker.js',
          maximumFileSizeToCacheInBytes: 20 * 1024 * 1024
        })
      ];

      // Workaround to suppress warnings caused by ts-morph in js-slang
      // if (config.module) {
      //   config.module.noParse = /node_modules\/@ts-morph\/common\/dist\/typescript\.js$/;
      // }

      return config;
    }
  },
  source: {
    define: {
      ...publicVars,
      'process.env': JSON.stringify(rawPublicVars)
    }
  },
  html: {
    template: './public/index.html',
    favicon: './public/icons/favicon.ico'
  },
  output: {
    distPath: {
      root: './build'
    },
    sourceMap: true
  }
});
