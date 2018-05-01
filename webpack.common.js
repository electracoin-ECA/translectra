const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin')
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
    ],
  },
}

const assets = {
  entry: {
    app: [
      './node_modules/bootstrap/dist/css/bootstrap.min.css',
      './app/css/index.css',
    ],
  },

  output: {
    path: __dirname + '/build',
    filename: '[name].css',
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextWebpackPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader',
        }),
      },
      {
        test: /\.(gif|jpg|png|woff2)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 1024,
          },
        }],
      },
    ],
  },

  plugins: [
    new CopyWebpackPlugin(
      [
        {
          from:  __dirname + '/node_modules/material-design-icons/iconfont/MaterialIcons-Regular.woff2',
          to: __dirname + '/public/fonts',
        },
      ]
    ),
    new ExtractTextWebpackPlugin('app.css'),
  ],
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

module.exports = [app, assets, server]
