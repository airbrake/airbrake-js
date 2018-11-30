const path = require('path')
const webpack = require('webpack')
const glob = require('glob')
const pkg = require('./package.json')

function newConfig() {
  return {
    mode: 'development',
    optimization: { nodeEnv: false },

    resolve: {
      extensions: ['.js', '.ts', '.tsx'],
    },

    module: {
      rules: [
        { test: /\.tsx?$/, loader: 'ts-loader' },
        { test: /\.tsx?$/, loader: 'tslint-loader', enforce: 'pre' },
        { test: /\.js$/, loader: 'source-map-loader', enforce: 'pre' },
        // Disable AMD.
        {
          test: require.resolve('error-stack-parser'),
          use: 'imports-loader?define=>false',
        },
        {
          test: require.resolve('stackframe'),
          use: 'imports-loader?define=>false',
        },
      ],
    },

    externals: {
      'cross-fetch': {
        commonjs: 'cross-fetch',
        commonjs2: 'cross-fetch',
        amd: 'cross-fetch',
        root: 'fetch',
      },
      os: {
        commonjs: 'os',
        commonjs2: 'os',
        amd: 'os',
      },
      process: {
        commonjs: 'process',
        commonjs2: 'process',
        amd: 'process',
      },
    },

    devtool: 'nosources-source-map',

    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
      libraryTarget: 'umd',
      // https://github.com/webpack/webpack/issues/6525
      globalObject: "typeof self !== 'undefined' ? self : this",
    },

    node: {
      process: false,
    },

    plugins: [
      new webpack.DefinePlugin({
        VERSION: JSON.stringify(pkg.version),
      }),
      new webpack.BannerPlugin({ banner: 'airbrake-js v' + pkg.version }),
    ],
  }
}

var client = newConfig()
var clientFiles = ['./src/internal/compat.ts', './src/client.ts']
client.entry = {
  client: clientFiles,
}
client.output.library = ['airbrakeJs', 'Client']

var clientMin = Object.assign({}, client)
clientMin.mode = 'production'
clientMin.entry = {
  'client.min': clientFiles,
}

var express = newConfig()
express.entry = {
  'instrumentation/express': './src/instrumentation/express.ts',
}
express.output.library = ['airbrakeJs', 'instrumentation', 'express']

var hapi = newConfig()
hapi.entry = {
  'instrumentation/hapi': './src/instrumentation/hapi.ts',
}
express.output.library = ['airbrakeJs', 'instrumentation', 'hapi']

module.exports = [client, clientMin, express, hapi]
