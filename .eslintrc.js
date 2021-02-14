module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint/eslint-plugin', 'eslint-plugin-tsdoc'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'standard'
  ],
  env: {
    jest: true,
    node: true
  },
  rules: {
    'tsdoc/syntax': 'error',

    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn'],

    'no-dupe-class-members': 'off',
    '@typescript-eslint/no-dupe-class-members': ['error'],

    'eslint-disable-next-line': 'off',
    '@typescript-eslint/no-explicit-any': ['warn'],

    'space-before-function-paren': 'off',

    'no-empty-function': 'off',

    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': ['error'],

    '@typescript-eslint/ban-types': ['warn']
  }
}
