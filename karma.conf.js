const path = require('path');
const webpack = require('webpack');


module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],


    // list of files / patterns to load in the browser
    files: [
      'src/internal/compat.ts',
      'test/unit/**/*_test.coffee',
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      '**/*.ts': ['webpack', 'sourcemap'],
      '**/*.coffee': ['webpack', 'sourcemap']
    },


    webpack: {
      resolve: {
        extensions: ['.js', '.coffee', '.ts', '.tsx']
      },

      module: {
        rules: [
          {test: /\.coffee$/, loader: 'coffee-loader'},
          {test: /\.tsx?$/, loader: 'awesome-typescript-loader'},
        ]
      },

      devtool: 'inline-source-map',

      plugins: [
        new webpack.DefinePlugin({
          VERSION: '"1.0.0"'
        }),
        new webpack.SourceMapDevToolPlugin({
          filename: null,
          test: /\.coffee$/
        })
      ],
    },

    webpackMiddleware: {
      stats: 'errors-only'
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


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
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
