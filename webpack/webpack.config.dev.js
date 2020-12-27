const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const packageJson = require('../package.json');
const {
  routers
} = require('./routers.dev.json');

const config = require('./config.dev.json');

const entry = {};
routers.forEach((r) => {
  entry[r.name] = r.entry;
});
const plugins = routers.map(r => new HtmlWebpackPlugin({
  template: r.template,
  filename: r.filename,
  chunks: [r.name],
  templateParameters: {
    'STATIC_PATH': config.STATIC_PATH,
  },
}));

const apis = [
  '/api/v1/*',
];

const proxy = {};
apis.forEach((api) => {
  proxy[api] = {
    target: config.PROXY_DOMAIN,
    changeOrigin: true,
    secure: false,
  };
})

module.exports = {
  mode: 'development',
  context: path.join(__dirname, '..', 'src/'),
  entry,
  devServer: {
    port: 8083,
    historyApiFallback: true,
    hot: true,
    proxy,
  },
  plugins: [
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(packageJson.version),
      __CONFIG__: JSON.stringify(config),
    }),
    new webpack.HotModuleReplacementPlugin(),
    // new WriteFilePlugin()
  ].concat(plugins),
  module: {
    rules: [{
      test: /\.jsx?$/,
      include: [
        path.join(__dirname, '..', 'src'),
      ],
      loader: 'babel-loader',
    }, {
      test: /\.css$/,
      use: [{
          loader: 'style-loader'
        },
        {
          loader: 'css-loader'
        },
      ],
    }, {
      test: /\.less$/,
      use: [{
          loader: 'style-loader'
        }, // creates style nodes from JS strings
        {
          loader: 'css-loader'
        }, // translates CSS into CommonJS
        {
          loader: 'less-loader',
          options: {
            javascriptEnabled: true
          }
        }, // compiles Less to CSS
      ],
    }, {
      test: /\.scss$/,
      use: [{
          loader: 'style-loader'
        },
        {
          loader: 'css-loader'
        },
        {
          loader: 'sass-loader'
        },
      ],
    }, {
      test: /\.(png|jpg|gif|svg|mp3|mp4|blob|woff|woff2|ttf|eot)$/,
      use: [{
        loader: 'file-loader',
        options: {
          outputPath: 'inject',
        },
      }, ],
    }, ],
  },
  output: {
    filename: '[name].bundle.js',
    path: path.join(__dirname, '..', 'www'),
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      '@common': path.resolve(__dirname, '../src/common'),
      '@assets': path.resolve(__dirname, '../src/assets'),
      '@models': path.resolve(__dirname, '../src/models'),
      '@utils': path.resolve(__dirname, '../src/utils'),
    },
  },
  externals: {},
};
