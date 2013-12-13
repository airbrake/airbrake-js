processor = (e, cb) ->
  if e.getErrorInfo?
    return cb(e.getErrorInfo())
   return cb(parseStack(e, e.stack))


funcName = (name) ->
  if (ind = name.lastIndexOf('.')) >= 0
    name = name[ind+1..]
  return name


parseStack = (e, stack) ->
  lines = stack.split('\n')

  # Chrome.
  funcFileLineColumnRe = /// ^
    \s{4}at\s
    (\w+)\s   # function
    \(
      (.+):   # file
      (\d+):  # line
      (\d+)   # column
    \)
  $ ///

  # Firefox.
  funcFileLineRe = /// ^
    (\w+)?@ # function
    (.+):   # file
    (\d+)   # line
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
    \w+:\s # type
    .+     # message
  $ ///

  backtrace = []
  for line in lines
    if line == '' then continue

    m = line.match(funcFileLineColumnRe)
    if m
      backtrace.push({
        function: funcName(m[1])
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
      backtrace.push({
        function: m[1]
        file: m[2]
        line: parseInt(m[3], 10)
        column: 0
      })
      continue

    m = line.match(typeMessageRe)
    if m
      continue

    console.debug("airbrake: can't parse", line)

  return {
    'type': e.name or typeof e
    'message': String(e)
    'backtrace': backtrace
  }


module.exports = processor
