truncate = require('./truncate.coffee')


# truncateObj truncates each key in the object separately, which is
# useful for handling circular references.
truncateObj = (obj, n=1000) ->
  dst = {}
  for key of obj
    dst[key] = truncate(obj[key], n=n)
  return dst


# jsonifyNotice serializes notice to JSON and truncates params,
# environment and session keys.
jsonifyNotice = (notice, n=1000, maxLength=64000) ->
  while true
    notice.params = truncateObj(notice.params, n=n)
    notice.environment = truncateObj(notice.environment, n=n)
    notice.session = truncateObj(notice.session, n=n)

    s = JSON.stringify(notice)
    if s.length < maxLength
      return s

    if n == 0
      break
    n = Math.floor(n/2)

  throw new Error("cannot jsonify notice (length=#{s.length} maxLength=#{maxLength})")


module.exports = jsonifyNotice
