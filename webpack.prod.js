const cleanWebpackPlugin = require('clean-webpack-plugin')
const [app, assets, server] = require('./webpack.common')
const merge = require('webpack-merge')

module.exports = [
  merge(app, {
    mode: 'production',

    plugins: [
      new cleanWebpackPlugin(['public/js']),
    ],
  }),

  merge(assets, {
    mode: 'production',

    plugins: [
      new cleanWebpackPlugin(['build']),
    ],
  }),

  merge(server, {
    mode: 'production',
  }),
]
