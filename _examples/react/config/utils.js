'use strict'

const Path = require('path')
const FS = require('fs')

const AppDirectory = FS.realpathSync(process.cwd())

module.exports.resolvePath = relativePath => Path.resolve(AppDirectory, relativePath)
