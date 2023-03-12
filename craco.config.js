const cracoConfig = (module.exports = {
  webpack: {
    configure: webpackConfig => {
      // avoid the entire process.env being inserted into the service worker
      // if SW_EXCLUDE_REGEXES is unset
      const definePlugin = webpackConfig.plugins.find(
        plugin => plugin.constructor.name === 'DefinePlugin'
      );
      const inlineProcessEnv = definePlugin.definitions['process.env'];
      if (!inlineProcessEnv.REACT_APP_SW_EXCLUDE_REGEXES) {
        inlineProcessEnv.REACT_APP_SW_EXCLUDE_REGEXES = undefined;
      }

      const injectManifestPlugin = webpackConfig.plugins.find(
        plugin => plugin.constructor.name === 'InjectManifest'
      );
      if (injectManifestPlugin) {
        injectManifestPlugin.config.maximumFileSizeToCacheInBytes = 10 * 1024 * 1024;
      }

      // add rules to pack WASM (for Sourceror)
      const wasmExtensionRegExp = /\.wasm$/;
      webpackConfig.resolve.extensions.push('.wasm');
      webpackConfig.module.rules.forEach(rule => {
        (rule.oneOf || []).forEach(oneOf => {
          if (oneOf.type === 'asset/resource') {
            oneOf.exclude.push(wasmExtensionRegExp);
          }
        });
      });
      // See https://webpack.js.org/configuration/experiments/#experiments.
      webpackConfig.experiments = {
        syncWebAssembly: true
      };
      webpackConfig.output.webassemblyModuleFilename = 'static/[hash].module.wasm';

      // Polyfill Node.js core modules.
      // An empty implementation (false) is provided when there is no browser equivalent.
      webpackConfig.resolve.fallback = {
        'child_process': false,
        'constants': require.resolve('constants-browserify'),
        'fs': false,
        'http': require.resolve('stream-http'),
        'https': require.resolve('https-browserify'),
        'os': require.resolve('os-browserify/browser'),
        'stream': require.resolve('stream-browserify'),
        'timers': require.resolve('timers-browserify'),
        'url': require.resolve('url/')
      };

      // workaround .mjs files by Acorn
      webpackConfig.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      });

      return webpackConfig;
    }
  },
  jest: {
    configure: jestConfig => {
      jestConfig.transformIgnorePatterns = [
        '[/\\\\]node_modules[/\\\\](?!(@ion-phaser[/\\\\]react[/\\\\])|(js-slang[/\\\\])|(array-move[/\\\\])|(konva[/\\\\.*])|(react-konva[/\\\\.*])).*\\.(js|jsx|ts|tsx)$',
        '^.+\\.module\\.(css|sass|scss)$'
      ];
      jestConfig.moduleNameMapper['ace-builds'] = '<rootDir>/node_modules/ace-builds';
      return jestConfig;
    }
  }
});
