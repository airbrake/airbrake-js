jsonify = require('../util/jsonify.coffee')


report = (notice, opts) ->
  url = "https://api.airbrake.io/api/v3/projects/#{opts.projectId}/notices?key=#{opts.projectKey}"
  payload = jsonify(notice)

  req = new global.XMLHttpRequest()
  req.open('POST', url, true)
  req.setRequestHeader('Content-Type', 'application/json')
  req.send(payload)
  req.onreadystatechange = ->
    if req.readyState == 4 and req.status == 201 and console?.debug?
      resp = JSON.parse(req.responseText)
      console.debug("airbrake: error #%d was reported: %s", resp.id, resp.url)


module.exports = report
