/* eslint-disable */

'use strict'

require('dotenv').config()

const Path = require('path')
const WebPack = require('webpack')
const HtmlWebPackPlugin = require('html-webpack-plugin')
const CleanPlugin = require('clean-webpack-plugin').CleanWebpackPlugin
const Config = require('../config')

const { paths } = Config
const templateParameters = () => Config.vars

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: Path.resolve(__dirname, '../src/index.jsx'),
  resolve: {
    extensions: ['.js', '.jsx']
  },
  devServer: {
    host: '0.0.0.0',
    port: Config.devServer.port,
    historyApiFallback: true,
    client: {
      overlay: {
        errors: true,
        warnings: false
      },
      progress: true
    },
    open: true
  },
  output: {
    pathinfo: false,
    filename: 'static/js/bundle.js',
    chunkFilename: 'static/js/[name].chunk.js',
    publicPath: '/'
  },
  plugins: [
    new CleanPlugin(),
    new WebPack.DefinePlugin(Config.envsAsString),
    new HtmlWebPackPlugin({
      inject: true,
      template: paths.indexHTML,
      templateParameters
    })
  ],
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.(js|jsx|mjs)$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: true
          }
        }
      }
    ]
  },
  performance: {
    hints: 'warning'
  }
}
