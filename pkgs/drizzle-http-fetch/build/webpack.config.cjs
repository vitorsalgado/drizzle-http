'use strict'

const Path = require('path')
const CleanPlugin = require('clean-webpack-plugin').CleanWebpackPlugin

const Cwd = process.cwd()

module.exports = {
  mode: 'production',
  bail: true,
  target: 'web',
  entry: {
    ts: Path.join(Cwd, 'src/__tests__/apiTs.ts'),
    js: Path.join(Cwd, 'src/__tests__/apiJs.js')
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
    extensions: ['.tsx', '.ts', '.js', '.json']
  },
  performance: {
    hints: 'warning'
  },
  stats: 'errors-only',
  output: {
    filename: '[name].js',
    path: Path.join(Cwd, 'src/__tests__/dist')
  }
}
