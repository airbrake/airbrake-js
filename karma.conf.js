const path = require('path');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config')[0];

process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function(config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'sinon-chai'],

    // list of files / patterns to load in the browser
    files: ['test/unit/**/*_test.ts'],

    mime: {
      'text/x-typescript': ['ts', 'tsx'],
    },

    // list of files to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      '**/*.ts': ['webpack', 'sourcemap'],
    },

    webpack: {
      resolve: webpackConfig.resolve,
      module: webpackConfig.module,
      externals: webpackConfig.externals,

      devtool: 'inline-source-map',

      plugins: [
        new webpack.DefinePlugin({
          VERSION: '"0.0.0"',
        }),
        new webpack.SourceMapDevToolPlugin({
          filename: null,
          test: /\.ts$/,
        }),
      ],
    },

    webpackMiddleware: {
      stats: 'errors-only',
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeHeadless'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: 1,
  });
};
