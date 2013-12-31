jsonify = require('../util/jsonify.coffee')


report = (notice, opts) ->
  url = "https://api.airbrake.io/api/v3/projects/#{opts.projectId}/notices?key=#{opts.projectKey}"
  payload = jsonify(notice)

  req = new global.XMLHttpRequest()
  req.open('POST', url, true)
  req.setRequestHeader('Content-Type', 'application/json')
  req.send(payload)


module.exports = report
