jsonifyNotice = require('../internal/jsonify_notice')


report = (notice, opts, promise) ->
  url = "#{opts.host}/api/v3/projects/#{opts.projectId}/notices?key=#{opts.projectKey}"
  payload = jsonifyNotice(notice)

  req = new global.XMLHttpRequest()
  req.open('POST', url, true)
  req.send(payload)
  req.onreadystatechange = ->
    if req.readyState == 4 and req.status == 200
      resp = JSON.parse(req.responseText)
      notice.id = resp.id
      promise.resolve(notice)


module.exports = report
