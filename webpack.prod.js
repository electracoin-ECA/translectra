const cleanWebpackPlugin = require('clean-webpack-plugin')
const common = require('./webpack.common')
const merge = require('webpack-merge')

module.exports = merge({
  mode: 'production',

  plugins: [
    new cleanWebpackPlugin(['build']),
  ],
}, common)
