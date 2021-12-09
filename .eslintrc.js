module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint/eslint-plugin', 'eslint-plugin-tsdoc'],
  extends: ['plugin:@typescript-eslint/recommended', 'standard', 'prettier'],
  root: true,
  env: {
    jest: true,
    node: true,
    browser: true
  },
  rules: {
    'tsdoc/syntax': 'error',

    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

    'no-dupe-class-members': 'off',
    '@typescript-eslint/no-dupe-class-members': ['error'],

    '@typescript-eslint/no-empty-function': ['warn'],

    'eslint-disable-next-line': 'off',
    '@typescript-eslint/no-explicit-any': ['warn'],

    'space-before-function-paren': 'off',

    'no-empty-function': 'off',

    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': ['error'],

    '@typescript-eslint/ban-types': ['warn'],
    '@typescript-eslint/no-inferrable-types': ['off'],

    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object']
      }
    ],
    'import/no-named-as-default': ['off'],
    'import/no-duplicates': ['off'],
    'import/no-mutable-exports': ['error'],
    'import/no-useless-path-segments': [
      'error',
      {
        noUselessIndex: true
      }
    ],
    'import/no-self-import': ['error'],
    'import/export': ['error'],
    'import/no-deprecated': ['error']
  }
}
