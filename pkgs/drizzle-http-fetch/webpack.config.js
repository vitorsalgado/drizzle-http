'use strict'

const Path = require('path')
const CleanPlugin = require('clean-webpack-plugin').CleanWebpackPlugin

module.exports = {
  mode: 'production',
  bail: true,
  entry: Path.resolve(__dirname, './out/index.js'),
  devtool: 'inline-source-map',
  plugins: [
    new CleanPlugin()
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],

    fallback: {
      querystring: require.resolve('querystring-es3'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('bops'),
      url: require.resolve('url/')
    }
  },

  performance: {
    hints: 'warning'
  },
  stats: 'errors-only',
  output: {
    filename: 'index.js',
    path: Path.resolve(__dirname, 'dist')
  }
}
