class WindowError extends Error
  constructor: (@_message, @_file, @_line) ->

  getErrorInfo: ->
    return {
      type: 'WindowError'
      message: @_message
      backtrace: [{
        function: ''
        file: @_file
        line: @_line
        column: 0
      }]
    }


module.exports = WindowError
