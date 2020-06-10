const cracoConfig = (module.exports = {
  webpack: {
    configure: webpackConfig => {
      // modify Workbox configuration
      if (cracoConfig.workbox) {
        const workboxPlugin = webpackConfig.plugins.find(
          plugin => plugin.constructor.name === 'GenerateSW'
        );
        workboxPlugin.config = cracoConfig.workbox(workboxPlugin.config);
      }

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
