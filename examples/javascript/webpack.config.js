'use strict'

const Path = require('path')
const CleanPlugin = require('clean-webpack-plugin').CleanWebpackPlugin

module.exports = {
  mode: 'production',
  bail: true,
  target: 'node',
  entry: {
    index: Path.resolve('./src/index.js')
  },
  devtool: 'source-map',
  optimization: {
    minimize: false
  },
  plugins: [new CleanPlugin()],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.json']
  },
  performance: {
    hints: 'warning'
  },
  stats: 'errors-only',
  output: {
    filename: '[name].js',
    path: Path.resolve('./dist')
  }
}
