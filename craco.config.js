module.exports = {
  webpack: {
    configure: webpackConfig => {
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
