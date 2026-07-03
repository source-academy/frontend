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
      'no-restricted-imports': ['error', ...restrictedImports],
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
);
