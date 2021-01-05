const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
var MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
var TerserPlugin = require('terser-webpack-plugin');
const packageJson = require('../package.json');
const {
  routers
} = require('./routers.production.json');

const config = require('./config.production.json');

const entry = {};
routers.forEach((r) => {
  entry[r.name] = r.entry;
});
const plugins = routers.map(r => new HtmlWebpackPlugin({
  template: r.template,
  filename: r.filename,
  chunks: [
    r.name,
  ],
  templateParameters: {
    'STATIC_PATH': config.STATIC_PATH,
  },
}));

module.exports = {
  context: path.join(__dirname, '..', 'src/'),
  entry,
  output: {
    path: path.join(__dirname, '..', '/dist/assets'),
    filename: '[name].[chunkhash:8].js',
    publicPath: config.STATIC_PATH
  },
  plugins: [
    new webpack.HashedModuleIdsPlugin(),
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(packageJson.version + (packageJson.pre_version ? '.pre' : '')),
      __CONFIG__: JSON.stringify(config),
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "[name].[chunkhash:8].css",
    }),
  ].concat(plugins),
  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: "babel-loader"
    },
    {
      test: /\.css$/,
      use: [{
        loader: MiniCssExtractPlugin.loader,
      }, { loader: 'css-loader', options: { importLoaders: 1 } }, 'postcss-loader']
    },
    {
      test: /\.scss$/,
      use: [{
        loader: MiniCssExtractPlugin.loader,
      }, { loader: 'css-loader', options: { importLoaders: 1 } }, 'postcss-loader', 'sass-loader']
    },
    {
      test: /\.less$/,
      use: [{
        loader: MiniCssExtractPlugin.loader,
      }, { loader: 'css-loader', options: { importLoaders: 1 } }, 'postcss-loader', {
        loader: 'less-loader',
        options: {
          javascriptEnabled: true
        }
      }]
    },
    {
      test: /\.(jpe?g|png|gif)$/i,
      use: 'url-loader?limit=10000!img?progressive=true'
    },
    {
      test: /\.(eot|woff|woff2|ttf|svg|mp3|mp4|blob|woff|woff2|ttf|eot)$/,
      use: 'url-loader?limit=10000'
    }, ],
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
  externals: {
    react: "React",
    'react-dom': "ReactDOM",
    moment: 'moment',
  },
  optimization: {
    minimizer: [new TerserPlugin({
      test: /\.jsx?$/i,
    })],
  },
};
