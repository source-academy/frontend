/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    // Equivalent to Jest's transformIgnorePatterns - modules that should be transformed
    transformIgnorePatterns: [
      'node_modules/(?!(@ion-phaser/react|js-slang|array-move|konva|react-konva|react-debounce-render|devlop|hastscript|hast-to-hyperscript|hast-util-.+|mdast-util-.+|micromark|micromark-.+|vfile|vfile-message|unist-util-.+|web-namespaces|rehype-react|unified|bail|is-plain-obj|trough|decode-named-character-reference|character-entities|trim-lines|property-information|space-separated-tokens|comma-separated-tokens|query-string|decode-uri-component|split-on-first|filter-obj|@sourceacademy/c-slang|java-parser|conductor)/).*'
    ]
  },
  resolve: {
    alias: {
      // File mocks for static assets
      '\\.(jpg|jpeg|png|gif)$': './src/fileMock.ts',
      '\\.svg$': 'identity-obj-proxy',
      '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
      // Module path fixes from original Jest config
      'unist-util-visit-parents/do-not-use-color': './node_modules/unist-util-visit-parents/lib',
      'vfile/do-not-use-conditional-minpath': './node_modules/vfile/lib',
      'vfile/do-not-use-conditional-minproc': './node_modules/vfile/lib',
      'vfile/do-not-use-conditional-minurl': './node_modules/vfile/lib'
    }
  }
});