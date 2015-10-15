jsonifyNotice = require('../internal/jsonify_notice')


report = (notice, opts, promise) ->
  url = "#{opts.host}/api/v3/projects/#{opts.projectId}/create-notice?key=#{opts.projectKey}"
  payload = jsonifyNotice(notice)

  req = new global.XMLHttpRequest()
  req.open('POST', url, true)
  if opts.contentType
    req.setRequestHeader 'Content-Type', opts.contentType
  req.send(payload)
  req.onreadystatechange = ->
    if req.readyState == 4 and req.status == 200
      resp = JSON.parse(req.responseText)
      notice.id = resp.id
      promise.resolve(notice)


module.exports = report
