onerror = (message, file, line, column, error) ->
  if message == 'Script error.'
    # Ignore.
    return

  if error
    global.Airbrake.push({error: error})
  else
    global.Airbrake.push({error: {
      message: message,
      fileName: file,
      lineNumber: line,
      columnNumber: column or 0,
    }})


models.exports = onerror
