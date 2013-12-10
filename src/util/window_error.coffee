class WindowError extends Error
  constructor: (@message, @fileName, @lineNumber) ->
    @name = 'WindowError'

  getErrorInfo: ->
    return {
      type: @name
      message: @message
      backtrace: [{
        function: ''
        file: @fileName
        line: @lineNumber
        column: 0
      }]
    }


module.exports = WindowError
