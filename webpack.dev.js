const [app, assets, server] = require('./webpack.common')
const merge = require('webpack-merge')

module.exports = [
  merge(app, {
    mode: 'development',
  }),

  merge(assets, {
    mode: 'development',
  }),

  merge(server, {
    mode: 'development',
  }),
]
