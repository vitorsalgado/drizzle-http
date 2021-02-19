'use strict'

const Joi = require('joi')
const EnvSchema = require('./envs')
const { resolvePath } = require('./utils')

const EnvVars = Joi.attempt(process.env, EnvSchema)

module.exports = {
  devServer: {
    devURL: EnvVars.DEV_SERVER || `http://0.0.0.0:${EnvVars.DEV_SERVER_PORT}`,
    port: EnvVars.DEV_SERVER_PORT
  },

  paths: {
    sources: resolvePath('src'),
    build: resolvePath('dist'),
    indexHTML: resolvePath('./site/index.html'),
    indexJS: resolvePath('./src/index.jsx'),
    packageJSON: resolvePath('package.json'),
    nodeModules: resolvePath('node_modules')
  },

  envsAsString: {
    'process.env': Object
      .keys(EnvVars)
      .reduce((env, key) => {
        env[key] = JSON.stringify(EnvVars[key])
        return env
      }, {})
  },

  vars: EnvVars
}
