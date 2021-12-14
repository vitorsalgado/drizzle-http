'use strict'

const Path = require('path')
const CleanPlugin = require('clean-webpack-plugin').CleanWebpackPlugin
const HtmlWebPackPlugin = require('html-webpack-plugin')
const Cwd = process.cwd()

console.log(Cwd)

module.exports = {
  mode: 'production',
  bail: true,
  target: 'web',
  entry: './__tests__/app.ts',
  devtool: 'inline-source-map',
  devServer: {
    hot: false,
    port: 3000,
    host: '0.0.0.0',
    historyApiFallback: true,
    client: {
      overlay: {
        errors: false,
        warnings: false
      },
      progress: false
    },
    open: false
  },
  plugins: [
    new CleanPlugin(),
    new HtmlWebPackPlugin({
      inject: true,
      template: './__tests__/index.html'
    })
  ],
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
        test: /\.ts$/,
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
    extensions: ['.ts', '.js', '.json']
  },
  performance: {
    hints: 'warning'
  },
  stats: 'errors-only',
  output: {
    filename: '[name].js',
    path: Path.join(Cwd, '__tests__/dist')
  }
}
