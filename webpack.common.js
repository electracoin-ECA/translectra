const nodeExternals = require('webpack-node-externals')

const app = {
  entry: {
    app: './app/index.js',
    vendors: './app/vendors.js'
  },

  target: 'web',

  output: {
    path: __dirname + '/public/js',
    filename: '[name].js',
  },

  resolve: {
    extensions: [".js", ".json"],
  },
}

const server = {
  entry: './src/index.js',

  target: 'node',

  output: {
    path: __dirname + '/build',
    filename: 'index.js',
  },

  resolve: {
    extensions: [".js", ".json"],
  },

  externals: [nodeExternals()],
}

module.exports = [app, server]
