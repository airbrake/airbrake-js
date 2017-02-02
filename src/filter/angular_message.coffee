re = ///^
  \[(\$.+)\] # type
  \s
  (.+)       # message
$///


filter = (notice) ->
  err = notice.errors[0]
  if err.type? and err.type != '' and err.type != 'Error'
    return notice
  if not err.message?
    return notice

  m = err.message.match(re)
  if m
    err.type = m[1]
    err.message = m[2]

  return notice


module.exports = filter
