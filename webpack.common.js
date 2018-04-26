const path = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: './src/index.js',

  target: 'node',

  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'index.js',
  },

  resolve: {
    extensions: [".js", ".json"],
  },

  externals: [nodeExternals()],
}
