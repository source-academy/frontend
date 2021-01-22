const _ = require('lodash');
const path = require("path");

const cracoConfig = (module.exports = {
  webpack: {
    configure: webpackConfig => {
      // modify Workbox configuration
      if (cracoConfig.workbox) {
        const workboxPlugin = webpackConfig.plugins.find(
          plugin => plugin.constructor.name === 'GenerateSW'
        );
        if (workboxPlugin) {
          workboxPlugin.config = cracoConfig.workbox(workboxPlugin.config);
        }
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
      webpackConfig.output.webassemblyModuleFilename = "static/[hash].module.wasm";

      // workaround .mjs files by Acorn
      webpackConfig.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      });
      if(process.env.NODE_ENV === "production") {
        // Make a second webpack config with a different entry point and output.
        // This preserves pretty much all other settings.
        const currEntryPoint = webpackConfig.entry[0];
        const serviceWorkerBuild = _.clone(webpackConfig);
        serviceWorkerBuild.entry = path.join(currEntryPoint, "../sw-custom.ts");
        serviceWorkerBuild.output = {
          path: webpackConfig.output.path,
          publicPath: webpackConfig.output.publicPath,
          filename: "sw-custom.js"
        };

        delete serviceWorkerBuild.optimization.splitChunks;
        delete serviceWorkerBuild.optimization.runtimeChunk;

        const ret = [webpackConfig, serviceWorkerBuild];
        // Fix CRA's print line
        // FIXME maybe we should just eject at this point...
        ret.output = webpackConfig.output;
        return ret;

        // If there's multiple webpack configs, it will build them in **parallel**
        // This breaks the following:
        /*
        Frankly this doesn't matter :D
        The project was built assuming it is hosted at /.
        You can control this with the homepage field in your package.json.

        The build folder is ready to be deployed.
        You may serve it with a static server:

          serve -s build

        Find out more about deployment here:

          bit.ly/CRA-deploy
        */
      } else {
        return webpackConfig;
      }

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
  },
  workbox: workboxConfig => {
    if (process.env.SW_EXCLUDE_REGEXES) {
      workboxConfig.navigateFallbackBlacklist.push(
        ...JSON.parse(process.env.SW_EXCLUDE_REGEXES).map(str => new RegExp(str))
      );
    }
    return workboxConfig;
  }
});
