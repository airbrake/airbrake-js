module.exports = function(grunt) {
  var pkg_data = grunt.file.readJSON('package.json');

  // Interpolates pkg variables into files during browserification
  function addPackageVars(file) {
    var through = require('through'), data = "";
    function write(buf) { data += grunt.template.process(buf, { pkg: pkg_data }); }
    function end() { this.queue(data); this.queue(null); }
    return through(write, end);
  }

  grunt.initConfig({
    pkg: pkg_data,
    copy: {
      build: { files: [{ expand: true, src: ['src/**'], dest: 'tmp/' }] }
    },
    bower: {
      dist: {
        dest: 'tmp/components'
      }
    },
    browserify: {
      options: { transform: [ addPackageVars ] },
      tracekit: {
        src: ['tmp/src/main-tracekit.js'],
        dest: 'dist/<%= pkg.name %>-tracekit.js'
      },
      'tracekit-sourcemap': {
        src: ['tmp/src/main-tracekit-sourcemaps.js'],
        dest: 'dist/<%= pkg.name %>-tracekit-sourcemap.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>-tracekit.min.js':             ['dist/<%= pkg.name %>-tracekit.js'],
          'dist/<%= pkg.name %>-tracekit-sourcemap.min.js':   ['dist/<%= pkg.name %>-tracekit-sourcemap.js']
        }
      }
    },
    jshint: {
      files: ['gruntfile.js', 'src/**/*.js', '!src/lib/**/*.js'],
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
        files: ['test/*.coffee', 'test/**/*.coffee'],
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
      integration_test: {
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
        compilers: ['coffee:coffee-script'],
        files: 'test/**/*.coffee',
        bail: true,
        reporter: 'spec'
      }
    },
    jasmine: {
      tracekit_processor: {
        src: 'test/examples/dist/<%= pkg.name %>-tracekit.js',
        options: {
          keepRunner: false,
          outfile: 'test/examples/tracekit_runner.html',
          specs: 'test/integration/spec/**/*.js'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-bower');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-template');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-mocha-cli');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  grunt.registerTask('test', ['mochacli', 'jshint']);

  // Running the `serve` command starts up a webserver
  grunt.registerTask('serve', ['connect']);

  grunt.registerTask('build', ['copy', 'bower', 'browserify']);
  grunt.registerTask('minify', ['uglify']);
  grunt.registerTask('default', ['build', 'minify']);

  // Push distribution libraries to CDN
  // Build and publish distribution site
  grunt.registerTask('publish', []);
};
