module.exports = (grunt) ->
  grunt.initConfig
    browserify:
      app:
        src: ['app.js']
        dest: 'dist/app.js'

  require('load-grunt-tasks') grunt
  grunt.registerTask('build', ['browserify'])
