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
        transform: ['coffeeify', addPackageVars]

      client:
        options:
          browserifyOptions:
            extensions: ['.coffee']
            standalone: 'airbrake-js.client'

        src: ['src/client.coffee']
        dest: 'dist/client.js'

      instrumentation_jquery:
        options:
          browserifyOptions:
            extensions: ['.coffee']
            standalone: 'airbrake-js.instrumentation.jquery'

        src: ['src/instrumentation/jquery.coffee']
        dest: 'dist/instrumentation/jquery.js'

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
  grunt.registerTask('default', ['build'])

  # Push distribution libraries to CDN.
  # Build and publish distribution site.
  grunt.registerTask('publish', [])
