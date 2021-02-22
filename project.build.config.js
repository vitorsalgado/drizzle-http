'use strict'

module.exports = {
  ignorePackages: [],
  dist: 'dist',
  distributions: [
    {
      from: 'dist-build/main',
      to: ''
    },
    {
      from: 'dist-build/es5',
      to: '/es5'
    }
  ]
}
