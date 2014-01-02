# https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Stack

processor = (e, cb) ->
  return cb('stack', parseStack(e))


# Chrome.
funcAliasFileLineColumnRe = /// ^
  \s{4}at\s
  (\S+)\s         # function
  \[as\s(\S+)\]\s # alias
  \(
    (.+):         # file
    (\d+):        # line
    (\d+)         # column
  \)
$ ///

# Chrome.
funcFileLineColumnRe = /// ^
  \s{4}at\s
  (\S+)\s   # function
  \(
    (.+):   # file
    (\d+):  # line
    (\d+)   # column
  \)
$ ///

# Firefox.
funcFileLineRe = /// ^
  (\S*)@ # function
  (.+):  # file
  (\d+)  # line
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

parseStack = (e, stack) ->
  stack = e.stack or ''
  lines = stack.split('\n')

  backtrace = []
  for line, i in lines
    if line == '' then continue

    m = line.match(funcAliasFileLineColumnRe)
    if m
      backtrace.push({
        function: m[1]
        file: m[3]
        line: parseInt(m[4])
        column: parseInt(m[5])
      })
      continue

    m = line.match(funcFileLineColumnRe)
    if m
      backtrace.push({
        function: m[1]
        file: m[2]
        line: parseInt(m[3])
        column: parseInt(m[4])
      })
      continue

    m = line.match(fileLineColumnRe)
    if m
      backtrace.push({
        function: ''
        file: m[1]
        line: parseInt(m[2], 10)
        column: parseInt(m[3], 10)
      })
      continue

    m = line.match(funcFileLineRe)
    if m
      if i == 0
        column = e.columnNumber or 0
      else
        column = -1
      backtrace.push({
        function: m[1]
        file: m[2]
        line: parseInt(m[3], 10)
        column: column
      })
      continue

    m = line.match(typeMessageRe)
    if m
      continue

    console.debug("airbrake: can't parse", line)

  if backtrace.length == 0 and (e.fileName or e.lineNumber or e.columnNumber)
    backtrace.push({
      function: ''
      file: e.fileName
      line: parseInt(e.lineNumber, 10)
      column: parseInt(e.columnNumber, 10)
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
    'type': type
    'message': msg
    'backtrace': backtrace
  }


module.exports = processor
