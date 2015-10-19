IGNORED_MESSAGES = [
  'Script error',
  'Script error.',
]


filter = (notice) ->
  msg = notice.errors[0].message
  if msg in IGNORED_MESSAGES
    return null
  return notice


module.exports = filter
