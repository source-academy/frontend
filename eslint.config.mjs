// @ts-check

import eslint from '@eslint/js';
import vitestPlugin from '@vitest/eslint-plugin';
import { defineConfig } from 'eslint/config';
import * as importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  { ignores: ['**/*.snap'] },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    name: 'Stylistic Rules',
    plugins: {
      import: importPlugin
    },
    rules: {
      'import/first': 'warn',
      'import/newline-after-import': 'warn',
      'import/no-duplicates': ['warn', { 'prefer-inline': true }],
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          named: {
            import: true,
            types: 'types-last'
          },
          alphabetize: {
            order: 'asc',
            orderImportKind: 'asc'
          },
        }
      ],
    },
    settings: {
      'import/internal-regex': '^src'
    }
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooksPlugin,
      react: reactPlugin,
      'react-refresh': reactRefresh
    },
    rules: {
      ...reactHooksPlugin.configs['recommended-latest'].rules,
      'no-empty': ['warn', { allowEmptyCatch: true }],
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
      
      'react-refresh/only-export-components': 'warn',

      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/camelcase': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/no-duplicate-enum-values': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
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
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
    }
  },
  {
    extends: [vitestPlugin.configs.recommended],
    files: ['**/*__tests__/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.vitest
    },
    plugins: {
      vitest: vitestPlugin
    },
    rules: {
      'no-empty-pattern': 'off',
      'vitest/expect-expect': 'off',
      'vitest/no-focused-tests': ['warn', { fixable: false }],
      'vitest/prefer-describe-function-title': 'warn',
      'vitest/valid-describe-callback': 'off',
      'vitest/valid-title': 'off',
    }
  },
);
