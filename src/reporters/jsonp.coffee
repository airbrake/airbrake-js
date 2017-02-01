jsonifyNotice = require('../internal/jsonify_notice')


cbCount = 0

report = (notice, opts, promise) ->
  cbCount++

  cbName = 'airbrakeCb' + String(cbCount)
  global[cbName] = (resp) ->
    notice.id = resp.id
    promise.resolve(notice)
    try
      delete global[cbName]
    catch _ # IE
      global[cbName] = undefined

  payload = encodeURIComponent(jsonifyNotice(notice))
  url = "#{opts.host}/api/v3/projects/#{opts.projectId}/notices?key=#{opts.projectKey}&callback=#{cbName}&body=#{payload}"

  document = global.document
  head = document.getElementsByTagName('head')[0]
  script = document.createElement('script')
  script.src = url
  removeScript = -> head.removeChild(script)
  script.onload = removeScript
  script.onerror = removeScript
  head.appendChild(script)


module.exports = report
