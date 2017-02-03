const path = require('path');
const webpack = require('webpack');
const glob = require('glob');
const pkg = require('./package.json');


function newConfig() {
  return {
    resolve: {
      extensions: ['.coffee']
    },

    module: {
      rules: [
        {test: /\.coffee$/, loader: 'coffee-loader'}
      ]
    },

    devtool: 'source-map',

    output: {
      filename: '[name].js',
      chunkFilename: '[id][name].js',
      path: path.resolve(__dirname, 'dist')
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
  'instrumentation/jquery': './src/instrumentation/jquery.coffee',
  'instrumentation/jquery.min': './src/instrumentation/jquery.coffee',
}
jquery.output.library = ['airbrakeJs', 'instrumentation', 'jquery'];


module.exports = [client, jquery];
