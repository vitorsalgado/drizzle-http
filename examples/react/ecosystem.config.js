'use strict'

module.exports = {
  apps: [
    {
      name: 'react-dev',
      script: 'yarn start:dev',
      instances: 1
    },
    {
      name: 'http-server',
      script: 'http/index.js',
      instances: 1
    }
  ]
}
