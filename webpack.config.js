const path = require('path');
const webpack = require('webpack');
const glob = require('glob');
const pkg = require('./package.json');


function newConfig() {
  return {
    resolve: {
      extensions: ['.js', '.coffee', '.ts', '.tsx']
    },

    module: {
      rules: [
        {test: /\.coffee$/, loader: 'coffee-loader'},
        {test: /\.tsx?$/, loader: 'ts-loader'},
        {test: /\.tsx?$/, loader: 'tslint-loader', enforce: 'pre'},
        {test: /\.js$/, loader: 'source-map-loader', enforce: 'pre'},
      ]
    },

    devtool: 'nosources-source-map',

    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
      libraryTarget: 'umd'
    },

    plugins: [
      new webpack.DefinePlugin({
        VERSION: JSON.stringify(pkg.version)
      }),
      new webpack.optimize.UglifyJsPlugin({
        include: /\.min\.js$/,
        sourceMap: true
      })
    ]
  }
};


var client = newConfig();
var clientFiles = ['./src/internal/compat.ts', './src/client.ts'];
client.entry = {
  'client': clientFiles,
  'client.min': clientFiles,
};
client.output.library = ['airbrakeJs', 'Client'];


var jquery = newConfig();
jquery.entry = {
  'instrumentation/jquery': './src/instrumentation/jquery.ts',
  'instrumentation/jquery.min': './src/instrumentation/jquery.ts',
}
jquery.output.library = ['airbrakeJs', 'instrumentation', 'jquery'];


var express = newConfig();
express.entry = {
  'instrumentation/express': './src/instrumentation/express.ts',
}
express.output.library = ['airbrakeJs', 'instrumentation', 'express'];


module.exports = [client, jquery, express];
