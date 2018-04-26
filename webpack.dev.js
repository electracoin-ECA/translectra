const common = require('./webpack.common')
const merge = require('webpack-merge')

module.exports = merge({
  mode: 'development',
}, common)
