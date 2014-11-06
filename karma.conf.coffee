module.exports = (config) ->
  config.set
    basePath: ''
    frameworks: ['requirejs', 'fixture', 'jquery-2.1.0', 'mocha', 'chai', 'sinon']
    plugins: ['karma-*']
    files: [
      {pattern: 'test/e2e/main_test.coffee'},
      {pattern: 'test/e2e/*.coffee', included: false},
      {pattern: 'test/e2e/fixtures/*'},
      {pattern: 'airbrake-shim.js'},
      {pattern: 'airbrake.js', included: false},
    ]
    browsers: ['Chrome']
    autoWatch: true
    preprocessors: {
      '**/*.coffee': ['coffee'],
      '**/*.html': ['html2js']
    }
