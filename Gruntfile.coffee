module.exports = (grunt) ->

  # Interpolates pkg variables into files during browserification.
  addPackageVars = (file) ->
    through = require('through')

    write = (buf) ->
      data += grunt.template.process(buf, {pkg: pkgData})

    end = ->
      @queue(data)
      @queue(null)

    data = ''
    through(write, end)

  pkgData = grunt.file.readJSON('package.json')

  grunt.initConfig
    pkg: pkgData

    browserify:
      options:
        transform: ['coffeeify', addPackageVars]

      stack:
        src: ['src/notifier.coffee']
        dest: 'dist/airbrake.js'

    uglify:
      options:
        sourceMap: 'dist/airbrake.min.map'
        sourceMappingURL: 'airbrake.min.map'
        sourceMapPrefix: 1

      dist:
        files: [{
          expand: true
          cwd: 'dist/'
          src: 'airbrake.js'
          dest: 'dist'
          ext: '.min.js'
        }]

    watch:
      test_only:
        files: ["test/**/*.coffee"]
        tasks: ["test"]
        options:
          interrupt: true

      build_and_test:
        files: ["test/**/*.coffee"]
        tasks: ["build", "test"]
        options:
          interrupt: true

    connect:
      integration_test:
        options:
          hostname: "*"
          port: 9001
          base: "."
          keepalive: true

    mochacli:
      all: ["test/**/*.coffee"]
      options:
        compilers: ["coffee:coffee-script"]
        files: "test/**/*.coffee"
        bail: true
        reporter: "spec"

  require("load-grunt-tasks") grunt
  grunt.registerTask("test", ["mochacli"])

  # Running the `serve` command starts up a webserver.
  grunt.registerTask("serve", ["connect"])
  grunt.registerTask("build", ["browserify"])
  grunt.registerTask("minify", ["uglify"])
  grunt.registerTask("default", ["build", "minify"])

  # Push distribution libraries to CDN.
  # Build and publish distribution site.
  grunt.registerTask("publish", [])
