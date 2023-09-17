module.exports = {
  extends: ['react-app', 'plugin:@typescript-eslint/recommended'],
  plugins: ['no-relative-import-paths', 'simple-import-sort'],
  rules: {
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/ban-types': 'off',
    'no-relative-import-paths/no-relative-import-paths': ['error', { allowSameFolder: true }],
    'simple-import-sort/imports': 'error'
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'].map(filename => `**/__tests__/**/${filename}`),
      rules: {
        'no-relative-import-paths/no-relative-import-paths': 'off'
      }
    }
  ]
};
