'use strict'

const Path = require('path')
const CleanPlugin = require('clean-webpack-plugin').CleanWebpackPlugin
const nodeExternals = require('webpack-node-externals')

module.exports = {
  context: __dirname,
  mode: 'production',
  target: 'node',
  bail: true,
  entry: {
    index: Path.resolve('./src/index.js')
  },
  devtool: 'source-map',
  externals: [nodeExternals()],
  externalsPresets: { node: true },
  optimization: {
    minimize: false
  },
  plugins: [new CleanPlugin()],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  },
  performance: {
    hints: 'warning'
  },
  stats: 'errors-only',
  output: {
    filename: '[name].js',
    path: Path.resolve('./dist'),
    libraryTarget: 'commonjs'
  }
}
