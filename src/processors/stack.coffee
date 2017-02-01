# https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Stack
# https://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
# http://msdn.microsoft.com/en-us/library/ie/hh699850%28v=vs.94%29.aspx
# http://ie.microsoft.com/testdrive/Browser/ExploreErrorStack/

rules = [
  {
    name: 'v8',
    re: /// ^
      \s*
      at\s
      (.+?)\s       # function
      \(
        (?:
          (?:
            (.+):  # file
            (\d+): # line
            (\d+)  # column
          )
          |
          (.+)
        )
      \)
    $ ///,
    fn: (m) ->
      return {
        function: m[1],
        file: m[2] or m[5],
        line: m[3] and parseInt(m[3], 10) or 0,
        column: m[4] and parseInt(m[4], 10) or 0,
      }
  },

  {
    name: 'firefox30',
    re: /// ^
      (.*)@  # function
      (.+):  # file
      (\d+): # line
      (\d+)  # column
    $ ///,
    fn: (m) ->
      func = m[1]
      file = m[2]

      # Handle "location line \d+ > eval"
      evaledRe = ///^
        (\S+)                    # file
        \s(line\s\d+\s>\seval.*) # hint
      $///
      if mm = file.match(evaledRe)
        if func.length > 0
          func = func + ' ' + mm[2]
        else
          func = mm[2]
        file = mm[1]

      return {
        function: func,
        file: file,
        line: parseInt(m[3], 10),
        column: parseInt(m[4], 10),
      }
  }

  {
    name: 'firefox14',
    re: /// ^
      (.*)@ # function
      (.+): # file
      (\d+) # line
    $ ///,
    fn: (m, i, e) ->
      if i == 0
        column = e.columnNumber or 0
      else
        column = 0
      return {
        function: m[1],
        file: m[2],
        line: parseInt(m[3], 10),
        column: column,
      }
  },

  {
    name: 'v8-short',
    re: /// ^
      \s*
      at\s
      (.+):  # file
      (\d+): # line
      (\d+)  # column
    $ ///,
    fn: (m) ->
      return {
        function: '',
        file: m[1],
        line: parseInt(m[2], 10),
        column: parseInt(m[3], 10),
      }
  },

  {
    name: 'phantomjs',
    re: /// ^
      \s*
      at\s
      (.+): # file
      (\d+) # line
    $ ///,
    fn: (m) ->
      return {
        function: '',
        file: m[1],
        line: parseInt(m[2], 10),
        column: 0,
      }
  },

  {
    name: 'default',
    re: /.+/,
    fn: (m) ->
      return {
        function: m[0],
        file: '',
        line: 0,
        column: 0,
      }
  }
]

typeMessageRe = /// ^
  \S+:\s # type
  .+     # message
$ ///

processor = (e, cb) ->
  processorName = 'nostack'
  stack = e.stack or ''
  lines = stack.split('\n')

  backtrace = []
  for line, i in lines
    if line == ''
      continue

    for rule in rules
      m = line.match(rule.re)
      if not m
        continue

      processorName = rule.name
      backtrace.push(rule.fn(m, i, e))

      break

  if processorName in ['v8', 'v8-short'] and
     backtrace.length > 0 and
     backtrace[0].function.match(typeMessageRe)
    backtrace = backtrace[1..]

  if backtrace.length == 0 and (e.fileName? or e.lineNumber? or e.columnNumber?)
    backtrace.push({
      function: '',
      file: e.fileName or '',
      line: parseInt(e.lineNumber, 10) or 0,
      column: parseInt(e.columnNumber, 10) or 0,
    })

  # ErrorEvent: https://developer.mozilla.org/en-US/docs/Web/API/ErrorEvent
  if backtrace.length == 0 and (e.filename? or e.lineno? or e.column? or e.colno?)
    backtrace.push({
      function: '',
      file: e.filename or '',
      line: parseInt(e.lineno, 10) or 0,
      column: parseInt(e.column or e.colno, 10) or 0,
    })

  if e.message?
    msg = String(e.message)
  else
    msg = String(e)

  if e.name? and e.name != ''
    type = e.name
  else
    type = ''

  if type == '' and msg == '' and backtrace.length == 0
    console?.warn?("airbrake: can't process error", e)
    return

  return cb(processorName, {
    'type': type,
    'message': msg,
    'backtrace': backtrace,
  })


module.exports = processor
