const path = require('path');
const webpack = require('webpack');
const glob = require('glob');
const pkg = require('./package.json');


function newConfig() {
  return {
    resolve: {
      extensions: ['.js', '.ts', '.tsx']
    },

    module: {
      rules: [
        {test: /\.tsx?$/, loader: 'ts-loader'},
        {test: /\.tsx?$/, loader: 'tslint-loader', enforce: 'pre'},
        {test: /\.js$/, loader: 'source-map-loader', enforce: 'pre'},
        // Disable AMD.
        {test: require.resolve('error-stack-parser'), use: 'imports-loader?define=>false'},
        {test: require.resolve('stackframe'), use: 'imports-loader?define=>false'},
      ]
    },

    devtool: 'nosources-source-map',

    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
      libraryTarget: 'umd'
    },

    node: {
      process: false
    },

    plugins: [
      new webpack.DefinePlugin({
        VERSION: JSON.stringify(pkg.version)
      }),
      new webpack.optimize.UglifyJsPlugin({
        include: /\.min\.js$/,
        sourceMap: true
      }),
      new webpack.BannerPlugin({banner: 'airbrake-js v' + pkg.version}),
    ]
  }
};


var client = newConfig();
var clientFiles = ['./src/internal/compat.ts', './src/client.ts'];
client.entry = {
  'client': clientFiles,
  'client.min': clientFiles
};
client.output.library = ['airbrakeJs', 'Client'];


var express = newConfig();
express.entry = {
  'instrumentation/express': './src/instrumentation/express.ts'
};
express.output.library = ['airbrakeJs', 'instrumentation', 'express'];


var hapi = newConfig();
hapi.entry = {
  'instrumentation/hapi': './src/instrumentation/hapi.ts'
};
express.output.library = ['airbrakeJs', 'instrumentation', 'hapi'];


module.exports = [client, express, hapi];
