const nodeExternals = require('webpack-node-externals')

const app = {
  entry: {
    app: './app/index.jsx',
    vendors: './app/vendors.js'
  },

  target: 'web',

  output: {
    path: __dirname + '/public/js',
    filename: '[name].js',
  },

  resolve: {
    extensions: [".js", ".jsx", ".json"],
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|vendors)/,
        use: ['babel-loader'],
      },
    ]
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
