// @ts-check

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

/** @type {import('jest').Config} */
export default {
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest'
  },
  transformIgnorePatterns: [
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
      'devlop',
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
      'comma-separated-tokens',
      'query-string',
      'decode-uri-component',
      'split-on-first',
      'filter-obj',
      '@sourceacademy/c-slang',
      'java-parser',
      'conductor'
    ),
    '^.+\\.module\\.(css|sass|scss)$'
  ],
  moduleNameMapper: {
    'unist-util-visit-parents/do-not-use-color':
      '<rootDir>/node_modules/unist-util-visit-parents/lib',
    'vfile/do-not-use-conditional-minpath': '<rootDir>/node_modules/vfile/lib',
    'vfile/do-not-use-conditional-minproc': '<rootDir>/node_modules/vfile/lib',
    'vfile/do-not-use-conditional-minurl': '<rootDir>/node_modules/vfile/lib'
  },
  setupFiles: [
    './src/i18n/i18n.ts' // Setup i18next configuration
  ]
};
