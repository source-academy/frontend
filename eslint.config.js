// @ts-check

import eslint from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import { reactRefresh } from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

const reactRestrictedImports = [
  'FC',
  'FunctionComponent',
  'SFC',
  'ReactNode',
  'ReactElement',
  'ComponentType',
  'JSX',
  'CSSProperties',
  'ErrorInfo',
  'MouseEvent',
  'MouseEventHandler',
  'KeyboardEvent',
  'RefObject',
  'Dispatch',
  'SetStateAction',
  'PropsWithChildren',
  'ChangeEvent',
  'ChangeEventHandler',
];

const restrictedImports = [
  ...reactRestrictedImports.map(importName => ({
    name: 'react',
    importNames: [importName],
    message: `Use the fully qualified name React.${importName} instead of importing ${importName} directly.`,
  })),
  {
    name: 'react-redux',
    importNames: ['useSelector'],
    message: 'Use the typed hook "useAppSelector" instead.',
  },
  {
    name: 'react-redux',
    importNames: ['useDispatch'],
    message: 'Use the typed hook "useAppDispatch" instead.',
  },
];

// The frontend names no language, and so does not depend on one: a language is an evaluator that the
// language directory lists, and that the frontend talks to over Conductor. js-slang is the evaluator
// of Source. These are what still imports it, each with its reason; a new use does not belong here.
// Add to the list only with an issue that says when it goes (#4587).
const jsSlangImportAllowlist = [
  // The room preview of the game runs the code of a room in-process, a frame at a time, with
  // live objects of the game that cannot cross to an evaluator (#4632).
  'src/features/game/scenes/roomPreview/RoomCodeRunner.ts',
  // The `require` that the module tabs' bundles get, which gives them js-slang's own modules.
  'src/commons/sideContent/SideContentHelper.ts',
  // Where the module loader is pointed at the modules' location.
  'src/index.tsx',
  // The tests (and what they share) build contexts and mock evaluators of js-slang.
  '**/*.test.{ts,tsx}',
  'src/commons/mocks/**',
];

/** The options of `no-restricted-imports`; js-slang is restricted except where it is allowed. */
const importRestrictions = (/** @type {{ allowJsSlang: boolean }} */ { allowJsSlang }) => [
  'error',
  {
    paths: restrictedImports,
    patterns: allowJsSlang
      ? []
      : [
          {
            group: ['js-slang', 'js-slang/**'],
            message: jsSlangMessage,
          },
        ],
  },
];

// `no-restricted-imports` does not see a dynamic `import()` or a `require()`.
const jsSlangMessage =
  'The frontend does not depend on a language: talk to the evaluator over Conductor. ' +
  'If a use is unavoidable, it goes on the allowlist in eslint.config.js with an issue.';
const jsSlangSyntaxRestrictions = [
  {
    selector: 'ImportExpression[source.value=/^js-slang/]',
    message: jsSlangMessage,
  },
  {
    selector: "CallExpression[callee.name='require'][arguments.0.value=/^js-slang/]",
    message: jsSlangMessage,
  },
];

export default tseslint.config(
  { ignores: ['build', 'node_modules', 'eslint.config.js', '**/*.snap'] },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  { settings: { react: { version: 'detect' } } },
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactHooksPlugin.configs.flat['recommended-latest'],
  // TODO: Enable when ready
  {
    plugins: {
      'react-refresh': reactRefresh.plugin,
    },
    rules: {
      'react-refresh/only-export-components': 'warn',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'react/prop-types': 'off',
      'react/jsx-boolean-value': ['warn', 'never', { always: ['value'] }],
      'react/self-closing-comp': 'error',
      'no-restricted-imports': importRestrictions({ allowJsSlang: false }),
      'no-restricted-syntax': ['error', ...jsSlangSyntaxRestrictions],
      curly: ['error', 'all'],
    },
  },
  {
    files: ['**/*.ts*'],
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'react-hooks/globals': 'warn', // TODO: Fix and delete (default is error)
      'react-hooks/immutability': 'warn', // TODO: Fix and delete (default is error)
      'react-hooks/purity': 'warn', // TODO: Fix and delete (default is error)
      'react-hooks/set-state-in-effect': 'warn', // TODO: Fix and delete (default is error)
      'react-hooks/static-components': 'warn', // TODO: Fix and delete (default is error)
      'react-hooks/refs': 'warn', // TODO: Fix and delete (default is error)
      'react-hooks/use-memo': 'warn', // TODO: Fix and delete (default is error)
      'no-empty': 'warn',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-duplicate-enum-values': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/camelcase': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-restricted-types': [
        'error',
        {
          types: {
            'React.FunctionComponent': {
              message: 'Use React.FC instead',
              fixWith: 'React.FC',
            },
          },
        },
      ],
      'simple-import-sort/imports': 'error',
    },
  },
  {
    // Where js-slang may still be imported (see the list above).
    files: jsSlangImportAllowlist,
    rules: {
      'no-restricted-imports': importRestrictions({ allowJsSlang: true }),
      'no-restricted-syntax': 'off',
    },
  },
);
