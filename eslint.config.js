// @ts-check

// Todo: Use ES module
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');

const FlatCompat = require('@eslint/eslintrc').FlatCompat;
const compat = new FlatCompat({
  baseDirectory: `${__dirname}`
});

module.exports = tseslint.config(
  { ignores: ['eslint.config.js'] },
  // eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...compat.config({
    extends: [
      'plugin:react-hooks/recommended'
      // "plugin:react/recommended",
      // "plugin:react/jsx-runtime"
    ],
    plugins: ['simple-import-sort'],
    rules: {
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
      '@typescript-eslint/ban-types': [
        'error',
        {
          // TODO: Change this to true someday
          extendDefaults: false,
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
  })
);
