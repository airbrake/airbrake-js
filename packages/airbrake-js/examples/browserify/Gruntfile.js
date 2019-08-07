module.exports = function(grunt) {
  grunt.initConfig({
    browserify: {
      app: {
        src: ['app.js'],
        dest: 'dist/app.js'
      }
    },
    uglify: {
      options: {
        sourceMap: true,
      },

      app: {
        src: 'dist/app.js',
        dest: 'dist/app.min.js'
      }
    }
  })

  require('load-grunt-tasks')(grunt);
  grunt.registerTask('build', ['browserify', 'uglify']);
}
