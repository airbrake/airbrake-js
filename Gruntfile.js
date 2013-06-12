module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: {
      build: { files: [{ expand: true, src: ['src/**'], dest: 'tmp/' }] }
    },
    browserify: {
      dist: {
        src: ['tmp/src/util/**/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= browserify.dist.dest %>']
        }
      }
    },
    jshint: {
      files: ['gruntfile.js', 'src/Client.js', 'src/notifier.js', 'src/stacktrace.js', 'src/util/**/*.js', 'src/processors/**/*.js', 'src/formatters/**/*.js', 'src/reporters/**/*.js', 'test/**/*.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>', 'test/**/*.coffee'],
      tasks: ['test']
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
        // require: ['should'],
        compilers: [ 'coffee:coffee-script' ],
        files: 'test/**/*.coffee',
        bail: true,
        reporter: 'spec'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-mocha-cli');

  grunt.registerTask('test', ['build', 'mochacli', 'jshint']);

  grunt.registerTask('build', ['copy', 'browserify']);
  grunt.registerTask('serve', ['connect']);
  grunt.registerTask('default', ['build']);

};
