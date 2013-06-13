module.exports = function(grunt) {
  var pkg_data = grunt.file.readJSON('package.json');

  grunt.initConfig({
    pkg: pkg_data,
    copy: {
      build: { files: [{ expand: true, src: ['src/**'], dest: 'tmp/' }] }
    },
    concat: {
      build: {
        src: ['legacy/notifier.js'],
        dest: 'tmp/src/legacy-notifier.js'
      }
    },
    bower: {
      dist: {
        dest: 'tmp/bower'
      }
    },
    browserify: {
      tracekit: {
        src: ['tmp/src/main-tracekit.js'],
        dest: 'dist/<%= pkg.name %>-tracekit.js'
      },
      stacktrace_js: {
        src: ['tmp/src/main-stacktrace_js.js'],
        dest: 'dist/<%= pkg.name %>-stacktrace_js.js'
      },
      fallback: {
        src: ['tmp/src/main-fallback.js'],
        dest: 'dist/<%= pkg.name %>-fallback.js'
      }
    },
    template: {
      tracekit_processor: {
        options: { data: { pkg: pkg_data, processor_name: 'tracekit_processor' } },
        files: { 'tmp/src/main-tracekit.js': 'tmp/src/main.js' }
      },
      stacktrace_js_processor: {
        options: { data: { pkg: pkg_data, processor_name: 'stacktrace_js_processor' } },
        files: { 'tmp/src/main-stacktrace_js.js': 'tmp/src/main.js' }
      },
      fallback_processor: {
        options: { data: { pkg: pkg_data, processor_name: 'fallback_processor' } },
        files: { 'tmp/src/main-fallback.js': 'tmp/src/main.js' }
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>-tracekit.min.js':      ['dist/<%= pkg.name %>-tracekit.js'],
          'dist/<%= pkg.name %>-stacktrace_js.min.js': ['dist/<%= pkg.name %>-stacktrace_js.js'],
          'dist/<%= pkg.name %>-fallback.min.js':      ['dist/<%= pkg.name %>-fallback.js']
        }
      }
    },
    jshint: {
      files: ['gruntfile.js', 'src/**/*.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          console: true,
          module: true,
          document: true
        }
      }
    },
    watch: {
      test_only: {
        files: ['test/**/*.coffee'],
        tasks: ['test'],
        options: { interrupt: true }
      },
      build_and_test: {
        files: ['<%= jshint.files %>'],
        tasks: ['build', 'test'],
        options: { interrupt: true }
      }
    },
    connect: {
      server: {
        options: {
          hostname: '*',
          port: 9001,
          base: '.',
          keepalive: true
        }
      }
    },
    mochacli: {
      all: ['test/**/*.coffee'],
      options: {
        compilers: [ 'coffee:coffee-script' ],
        files: 'test/**/*.coffee',
        bail: true,
        reporter: 'spec'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-bower');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-template');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-mocha-cli');

  grunt.registerTask('test', ['mochacli', 'jshint']);

  grunt.registerTask('build', ['copy', 'bower', 'concat', 'template', 'browserify']);
  grunt.registerTask('minify', ['uglify']);
  grunt.registerTask('serve', ['connect']);
  grunt.registerTask('default', ['build', 'minify']);

};
