'use strict'

const Path = require('path')
const CleanPlugin = require('clean-webpack-plugin').CleanWebpackPlugin

module.exports = {
  mode: 'production',
  bail: true,
  entry: {
    ts: Path.resolve(__dirname, '../src/__tests__/test/apiTs.ts'),
    js: Path.resolve(__dirname, '../src/__tests__/test/apiJs.js')
  },
  devtool: 'inline-source-map',
  plugins: [new CleanPlugin()],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
          }
        ],
        exclude: /node_modules/
      }
    ]
  },
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
    filename: '[name].js',
    path: Path.join(process.cwd(), 'src', '__tests__', 'test', 'dist')
  }
}
