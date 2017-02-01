ErrorStackParser = require('error-stack-parser')


processor = (e, cb) ->
  frames = ErrorStackParser.parse(e)

  backtrace = []
  for frame in frames
    backtrace.push({
      function: frame.functionName,
      file: frame.fileName,
      line: frame.lineNumber,
      column: frame.columnNumber,
    })

  if e.message?
    msg = String(e.message)
  else
    msg = String(e)

  if e.name? and e.name != ''
    type = e.name
  else
    # Extract type from messages like "Uncaught Exception: message.".
    uncaughtExcRe = ///^
      Uncaught\s
      (.+?)      # type
      :\s
      (.+)       # message
    $///
    m = msg.match(uncaughtExcRe)
    if m
      type = m[1]
      msg = m[2]
    else
      type = ''

  if type == '' and msg == '' and backtrace.length == 0
    console?.warn?("airbrake: can't process error", e)
    return

  cb('stacktracejs', {
    type: type,
    message: msg,
    backtrace: backtrace,
  })


module.exports = processor
