module.exports = (grunt) ->
  pkgData = grunt.file.readJSON('package.json')

  # Interpolates pkg variables into files during browserification.
  addPackageVars = (file) ->
    through = require('through')

    write = (buf) ->
      data += grunt.template.process(String(buf), {pkg: pkgData})

    end = ->
      @queue(data)
      @queue(null)

    data = ''
    return through(write, end)

  grunt.initConfig
    pkg: pkgData

    browserify:
      options:
        browserifyOptions:
          extensions: ['.coffee']
        transform: ['coffeeify', addPackageVars]

      stack:
        src: ['src/notifier.coffee']
        dest: 'airbrake.js'

    uglify:
      options:
        sourceMap: true

      dist:
        files: [{
          expand: true
          src: 'airbrake.js'
          ext: '.min.js'
        }]

    watch:
      test_only:
        files: ['test/unit/**/*.coffee']
        tasks: ['test']
        options:
          interrupt: true

      build_and_test:
        files: ['test/unit/**/*.coffee']
        tasks: ['build', 'test']
        options:
          interrupt: true

    connect:
      server:
        options:
          port: 9001
          keepalive: true

      integration_test:
        options:
          hostname: '*'
          port: 9001
          base: '.'
          keepalive: true

    mochacli:
      all: ['test/unit/**/*.coffee']
      options:
        compilers: ['coffee:coffee-script/register']
        files: 'test/unit/*.coffee'
        bail: true
        reporter: 'spec'

    bump:
      options:
        updateConfigs: ['pkg']

    karma:
      unit:
        configFile: 'karma.conf.coffee'


  require('load-grunt-tasks') grunt
  grunt.registerTask('test', ['mochacli'])

  # Running the `serve` command starts up a webserver.
  grunt.registerTask('serve', ['connect'])
  grunt.registerTask('build', ['browserify'])
  grunt.registerTask('minify', ['uglify'])
  grunt.registerTask('default', ['build', 'minify'])

  # Push distribution libraries to CDN.
  # Build and publish distribution site.
  grunt.registerTask('publish', [])
