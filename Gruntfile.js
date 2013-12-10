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
      build: { files: [{ expand: true, src: ['src/**/*.js'], dest: 'tmp/' }] }
    },
    coffee: {
      source: {
        options: {
          bare: false
        },
        cwd: '.',
        expand: true,
        src: ['src/**/*.coffee'],
        dest: 'tmp/',
        ext: '.js'
      }
    },
    browserify: {
      options: { transform: [ addPackageVars ] },
      notifier: {
        src: ['tmp/src/notifier.js'],
        dest: 'dist/<%= pkg.name %>.js'
      },
      notifier_source_map: {
        src: ['tmp/src/notifier-source-map.js'],
        dest: 'dist/<%= pkg.name %>-source-map.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['dist/<%= pkg.name %>.js'],
          'dist/<%= pkg.name %>-source-map.min.js': ['dist/<%= pkg.name %>-source-map.js']
        }
      }
    },
    jshint: {
      files: ['gruntfile.js'],
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
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-copy');
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

  grunt.registerTask('build', ['copy', 'coffee', 'browserify']);
  grunt.registerTask('minify', ['uglify']);
  grunt.registerTask('default', ['build', 'minify']);

  // Push distribution libraries to CDN
  // Build and publish distribution site
  grunt.registerTask('publish', []);
};
