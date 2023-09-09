// eslint-disable-next-line @typescript-eslint/no-var-requires
const webpack = require('webpack');

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
        injectManifestPlugin.config.maximumFileSizeToCacheInBytes = 15 * 1024 * 1024;
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
        'path/posix': require.resolve('path-browserify'),
        'stream': require.resolve('stream-browserify'),
        'timers': require.resolve('timers-browserify'),
        'url': require.resolve('url/')
      };

      // workaround .mjs files by Acorn
      webpackConfig.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
        resolve: {
          fullySpecified: false
        },
      });

      // Ignore warnings for dependencies that do not ship with a source map.
      // This is because we cannot do anything about our dependencies.
      webpackConfig.ignoreWarnings = [{
        module: /node_modules/,
        message: /Failed to parse source map/
      }];

      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        // Make environment variables available in the browser by polyfilling the 'process' Node.js module.
        new webpack.ProvidePlugin({
          process: 'process/browser',
        }),
        // Make the 'buffer' Node.js module available in the browser.
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        })
      ];

      // Workaround to suppress warnings caused by ts-morph in js-slang
      webpackConfig.module.noParse = /node_modules\/@ts-morph\/common\/dist\/typescript\.js$/;

      return webpackConfig;
    }
  },
  jest: {
    configure: jestConfig => {
      jestConfig.transformIgnorePatterns = [
        // Will give something like
        // '[/\\\\]node_modules[/\\\\]
        //  (?!
        //  (   @ion-phaser[/\\\\]react[/\\\\.*]    )|
        //  (   js-slang[/\\\\.*]                   )|
        //  (   array-move[/\\\\.*]                 )|
        //      ...
        //  (   comma-separated-tokens[/\\\\.*]   )
        //  ).*.(js|jsx|ts|tsx)$'
        ignoreModulePaths(
          '@ion-phaser/react',
          'js-slang',
          'array-move',
          'konva',
          'react-konva',
          'react-debounce-render',
          'hastscript',
          'hast-to-hyperscript',
          'hast-util-.+',
          'mdast-util-.+',
          'micromark',
          'micromark-.+',
          'vfile',
          'vfile-message',
          'unist-util-.+',
          'web-namespaces',
          'rehype-react',
          'unified',
          'bail',
          'is-plain-obj',
          'trough',
          'decode-named-character-reference',
          'character-entities',
          'trim-lines',
          'property-information',
          'space-separated-tokens',
          'comma-separated-tokens'
        ),
        '^.+\\.module\\.(css|sass|scss)$'
      ];
      jestConfig.moduleNameMapper['ace-builds'] = '<rootDir>/node_modules/ace-builds';
      return jestConfig;
    }
  }
});

const ignoreModulePaths = (...paths) => {
  const moduleRoot = replaceSlashes('/node_modules/');
  const modulePaths = paths
    .map(replaceSlashes)
    .map(path => `(${path}[/\\\\.*])`)
    .join('|');
  return moduleRoot + '(?!' + modulePaths + ').*.(js|jsx|ts|tsx)$';
};
const replaceSlashes = target => {
  return target.replaceAll('/', '[/\\\\]');
};
