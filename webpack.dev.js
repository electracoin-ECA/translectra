const [app, server] = require('./webpack.common')
const merge = require('webpack-merge')

module.exports = [
  merge(app, {
    mode: 'development',
  }),

  merge(server, {
    mode: 'development',
  }),
]
