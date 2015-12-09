module.exports = (grunt) ->
  pkgData = grunt.file.readJSON('package.json')

  grunt.initConfig
    pkg: pkgData

    coffee:
      src:
        expand: true
        cwd: 'src/'
        src: ['**/*.coffee']
        dest: 'lib/'
        ext: '.js'

    browserify:
      options:
        transform: ['coffeeify']

      client:
        options:
          browserifyOptions:
            extensions: ['.coffee']
            standalone: 'airbrake-js.Client'

        src: ['src/client.coffee']
        dest: 'dist/client.js'

      instrumentation_jquery:
        options:
          browserifyOptions:
            extensions: ['.coffee']
            standalone: 'airbrake-js.instrumentation.jquery'

        src: ['src/instrumentation/jquery.coffee']
        dest: 'dist/instrumentation/jquery.js'

    concat:
      options:
        process: {pkg: pkgData}

      lib:
        src: ['lib/client.js']
        dest: 'lib/client.js'

      dist:
        src: ['dist/client.js']
        dest: 'dist/client.js'

    uglify:
      options:
        sourceMap: true

      client:
        src: 'dist/client.js'
        dest: 'dist/client.min.js'

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
  grunt.registerTask('build', ['coffee', 'browserify', 'concat', 'uglify'])
  grunt.registerTask('default', ['build'])

  # Push distribution libraries to CDN.
  # Build and publish distribution site.
  grunt.registerTask('publish', [])
