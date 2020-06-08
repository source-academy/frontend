module.exports = {
  webpack: {
    configure: webpackConfig => {
      // disable source maps to speed up CI build
      // note: if we ever start deploying from CI, this must be undone in
      // deployment builds
      if (process.env.CI) {
        webpackConfig.devtool = false;
        webpackConfig.optimization.minimizer.find(
          p => p.constructor.name === 'TerserPlugin'
        ).options.sourceMap = false;
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
  }
};
