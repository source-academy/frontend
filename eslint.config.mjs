// @ts-check

import eslint from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['eslint.config.mjs', '**/*.snap'] },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  // TODO: Enable when ready
  {
    plugins: {
      'react-refresh': reactRefresh
    },
    rules: {
      'react-refresh/only-export-components': 'warn'
    }
  },
  reactHooksPlugin.configs.flat['recommended-latest'],
  {
    files: ['**/*.ts*'],
    plugins: {
      react: reactPlugin,
      'simple-import-sort': simpleImportSort
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
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-redux',
              importNames: [
                // TODO: Create typed hook for useDispatch
                // "useDispatch",
                'useSelector'
              ],
              message: 'Use the typed hook "useTypedSelector" instead.'
            }
          ]
        }
      ],
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
              fixWith: 'React.FC'
            }
          }
        }
      ],
      'simple-import-sort/imports': 'error'
    }
  }
);
