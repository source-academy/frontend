const cracoConfig = {
  jest: {
    // configure: jestConfig => {
    //   jestConfig.setupFiles = [
    //     ...jestConfig.setupFiles,
    //     './src/i18n/i18n.ts' // Setup i18next configuration
    //   ];
    //   return jestConfig;
    // }
  },
  babel: {
    presets: [['@babel/preset-typescript']]
  }
};

module.exports = cracoConfig;
