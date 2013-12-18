module.exports = (grunt) ->

  # Interpolates pkg variables into files during browserification
  addPackageVars = (file) ->
    write = (buf) ->
      data += grunt.template.process(buf,
        pkg: pkg_data
      )
    end = ->
      @queue data
      @queue null
    through = require("through")
    data = ""
    through write, end
  pkg_data = grunt.file.readJSON("package.json")

  grunt.initConfig
    pkg: pkg_data
    coffee:
      source:
        options:
          sourceMap: true
          bare: false

        cwd: "."
        expand: true
        src: ["src/**/*.coffee"]
        dest: "tmp/"
        ext: ".js"

    browserify:
      options:
        transform: [addPackageVars]

      tracekit:
        src: ["tmp/src/notifier.js"]
        dest: "dist/<%= pkg.name %>.js"

    uglify:
      options:
        banner: "/*! <%= pkg.name %> <%= grunt.template.today(\"dd-mm-yyyy\") %> */\n"

      dist:
        files:
          "dist/<%= pkg.name %>.min.js": ["dist/<%= pkg.name %>.js"]

    jshint:
      files: ["gruntfile.js", "src/**/*.js", "!src/lib/**/*.js"]
      options:

        # options here to override JSHint defaults
        globals:
          console: true
          module: true
          document: true

    watch:
      test_only:
        files: ["test/*.coffee", "test/**/*.coffee"]
        tasks: ["test"]
        options:
          interrupt: true

      build_and_test:
        files: ["<%= jshint.files %>"]
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

    jasmine:
      tracekit_processor:
        src: "test/examples/dist/<%= pkg.name %>-tracekit.js"
        options:
          keepRunner: false
          outfile: "test/examples/tracekit_runner.html"
          specs: "test/integration/spec/**/*.js"

  require("load-grunt-tasks") grunt
  grunt.registerTask "test", ["mochacli", "jshint"]

  # Running the `serve` command starts up a webserver
  grunt.registerTask "serve", ["connect"]
  grunt.registerTask "build", ["coffee", "browserify"]
  grunt.registerTask "minify", ["uglify"]
  grunt.registerTask "default", ["build", "minify"]

  # Push distribution libraries to CDN
  # Build and publish distribution site
  grunt.registerTask "publish", []
