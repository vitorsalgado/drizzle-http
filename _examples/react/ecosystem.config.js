'use strict'

module.exports = {
  apps: [
    {
      name: 'react-dev',
      script: 'npm run start:dev',
      instances: 1
    },
    {
      name: 'http-server',
      script: 'http/index.js',
      instances: 1
    }
  ]
}
