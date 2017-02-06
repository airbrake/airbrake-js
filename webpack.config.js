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
        {test: /\.tsx?$/, loader: 'awesome-typescript-loader'},
        {test: /\.js$/, use: ['source-map-loader'], enforce: 'pre'},
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
client.entry = {
  'client': './src/client.coffee',
  'client.min': './src/client.coffee'
};
client.output.library = ['airbrakeJs', 'Client'];


var jquery = newConfig();
jquery.entry = {
  'instrumentation/jquery': './src/instrumentation/jquery.ts',
  'instrumentation/jquery.min': './src/instrumentation/jquery.ts',
}
jquery.output.library = ['airbrakeJs', 'instrumentation', 'jquery'];


module.exports = [client, jquery];
