truncate = require('./truncate.coffee')


truncateObj = (obj) ->
  dst = {}
  for key of obj
    dst[key] = truncate(obj[key])
  return dst


# jsonifyNotice truncates each value in params, environment and
# session separately and then serializes notice in JSON.
jsonifyNotice = (notice) ->
  notice.params = truncateObj(notice.params)
  notice.environment = truncateObj(notice.environment)
  notice.session = truncateObj(notice.session)
  return JSON.stringify(notice)


module.exports = jsonifyNotice
