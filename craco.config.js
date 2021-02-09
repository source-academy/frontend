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
      // adapted from https://prestonrichey.com/blog/react-rust-wasm/
      const wasmExtensionRegExp = /\.wasm$/;
      webpackConfig.resolve.extensions.push('.wasm');
      webpackConfig.module.rules.forEach(rule => {
        (rule.oneOf || []).forEach(oneOf => {
          if (oneOf.loader && oneOf.loader.indexOf('file-loader') >= 0) {
            // Make file-loader ignore WASM files
            oneOf.exclude.push(wasmExtensionRegExp);
          }
        });
      });
      webpackConfig.output.webassemblyModuleFilename = 'static/[hash].module.wasm';

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
        '[/\\\\]node_modules[/\\\\](?!(@ion-phaser[/\\\\]react[/\\\\])).*\\.(js|jsx|ts|tsx)$',
        '^.+\\.module\\.(css|sass|scss)$'
      ];
      jestConfig.moduleNameMapper['ace-builds'] = '<rootDir>/node_modules/ace-builds';
      return jestConfig;
    }
  }
});
