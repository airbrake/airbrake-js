# https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Stack

processor = (e, cb) ->
  return cb('stack', parseStack(e))


# Chrome.
funcAliasFileLineColumnRe = /// ^
  \s{4}at\s
  (.+)\s          # function
  \[as\s(\S+)\]\s # alias
  \(
    (?:
      (?:
        (.+):     # file
        (\d+):    # line
        (\d+)     # column
      )|native
    )
  \)
$ ///

# Chrome.
funcFileLineColumnRe = /// ^
  \s{4}at\s
  (.+)\s       # function
  \(
    (?:
      (?:
        (.+):  # file
        (\d+): # line
        (\d+)  # column
      )|native
    )
  \)
$ ///

# Chrome.
fileLineColumnRe = /// ^
  \s{4}at\s
  (.+):     # file
  (\d+):    # line
  (\d+)     # column
$ ///

# Chrome.
typeMessageRe = /// ^
  \S+:\s # type
  .+     # message
$ ///

# Firefox.
funcFileLineRe = /// ^
  (.*)@ # function
  (.+): # file
  (\d+) # line
$ ///

# Firefox >= 30.
funcFileLineColumnRe2 = /// ^
  (.*)@  # function
  (.+):  # file
  (\d+): # line
  (\d+)  # column
$ ///

parseStack = (e, stack) ->
  stack = e.stack or ''
  lines = stack.split('\n')

  backtrace = []
  for line, i in lines
    if line == '' then continue

    m = line.match(funcAliasFileLineColumnRe)
    if m
      backtrace.push({
        function: m[1],
        file: m[3] or '',
        line: m[4] and parseInt(m[4], 10) or 0,
        column: m[5] and parseInt(m[5], 10) or 0,
      })
      continue

    m = line.match(funcFileLineColumnRe)
    if m
      backtrace.push({
        function: m[1],
        file: m[2] or '',
        line: m[3] and parseInt(m[3], 10) or 0,
        column: m[4] and parseInt(m[4], 10) or 0,
      })
      continue

    m = line.match(funcFileLineColumnRe2)
    if m
      backtrace.push({
        function: m[1],
        file: m[2],
        line: parseInt(m[3], 10),
        column: parseInt(m[4], 10),
      })
      continue

    m = line.match(fileLineColumnRe)
    if m
      backtrace.push({
        function: '',
        file: m[1],
        line: parseInt(m[2], 10),
        column: parseInt(m[3], 10),
      })
      continue

    m = line.match(funcFileLineRe)
    if m
      if i == 0
        column = e.columnNumber or 0
      else
        column = 0
      backtrace.push({
        function: m[1],
        file: m[2],
        line: parseInt(m[3], 10),
        column: column,
      })
      continue

    m = line.match(typeMessageRe)
    if m
      continue

    console?.debug?("airbrake: can't parse", line)
    backtrace.push({
      function: '',
      file: line,
      line: 0,
      column: 0,
    })

  if backtrace.length == 0 and (e.fileName? or e.lineNumber? or e.columnNumber?)
    backtrace.push({
      function: '',
      file: e.fileName or '',
      line: parseInt(e.lineNumber, 10) or 0,
      column: parseInt(e.columnNumber, 10) or 0,
    })

  if e.message?
    msg = e.message
  else
    msg = String(e)

  if e.name?
    type = e.name
    msg = type + ': ' + msg
  else
    type = ''

  return {
    'type': type,
    'message': msg,
    'backtrace': backtrace,
  }


module.exports = processor
