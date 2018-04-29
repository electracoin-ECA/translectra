const cleanWebpackPlugin = require('clean-webpack-plugin')
const [app, server] = require('./webpack.common')
const merge = require('webpack-merge')

module.exports = [
  merge(app, {
    mode: 'production',

    plugins: [
      new cleanWebpackPlugin(['public/js']),
    ],
  }),

  merge(server, {
    mode: 'production',

    plugins: [
      new cleanWebpackPlugin(['build']),
    ],
  })
]
