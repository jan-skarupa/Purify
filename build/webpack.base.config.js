const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const BabelMinify = require('babel-minify-webpack-plugin')
// const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
  entry: {
    'background': ['babel-polyfill', './src/background.js'],
    'content': ['babel-polyfill', './src/content.js'],
    // 'dom-manipulator': './src/dom-manipulator.js',
    'pages/popup': ['babel-polyfill', './src/pages/popup.js']
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js',
    sourceMapFilename: '[name].map'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          'presets': [['env', { 'targets': { 'node': 4 }}]]
        }
      }
    ]
  },
  // watch: true,
  devtool: '#source-map',
  plugins: [
    // new BabelMinify(),
    new CopyWebpackPlugin([
      {
        from: './src/static',
        to: path.resolve(__dirname, '../dist')
      },
      {
        from: './src/pages',
        to: path.resolve(__dirname, '../dist/pages')
      }
    ])
  ]
}
